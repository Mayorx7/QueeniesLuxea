-- Manual bank-transfer invoices, evidence, verification, and receipts.
-- Apply after the existing orders/auth migrations.

create table if not exists public.vendor_payment_settings (
  vendor_id uuid primary key references public.profiles(id) on delete cascade,
  bank_name text not null check (length(trim(bank_name)) > 1),
  account_name text not null check (length(trim(account_name)) > 1),
  account_number text not null check (length(trim(account_number)) between 6 and 32),
  payment_instructions text,
  payment_deadline_hours integer check (payment_deadline_hours between 1 and 720),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.orders(id) on delete restrict,
  invoice_number text not null unique, issued_at timestamptz not null default now(), due_at timestamptz,
  amount_due numeric(14,2) not null check(amount_due >= 0), currency text not null default 'NGN',
  billing_snapshot jsonb not null, bank_details_snapshot jsonb not null,
  status text not null default 'issued' check (status in ('issued','payment_submitted','paid','expired','cancelled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete restrict,
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  payment_method text not null default 'bank_transfer' check(payment_method = 'bank_transfer'),
  amount_claimed numeric(14,2) not null check(amount_claimed > 0), amount_received numeric(14,2),
  transaction_reference text not null, status text not null default 'payment_submitted' check(status in ('payment_submitted','under_review','verified','rejected')),
  verified_by uuid references public.profiles(id), verified_at timestamptz, rejection_reason text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((status <> 'verified') or (amount_received is not null and verified_by is not null and verified_at is not null))
);
create unique index if not exists one_active_transfer_claim_per_order on public.payments(order_id) where status in ('payment_submitted','under_review');

create table if not exists public.payment_evidence (
  id uuid primary key default gen_random_uuid(), payment_id uuid not null references public.payments(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete restrict, object_path text not null unique,
  original_filename text not null, mime_type text not null check(mime_type in ('image/jpeg','image/png','application/pdf')),
  file_size bigint not null check(file_size > 0 and file_size <= 10485760), uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(), receipt_number text not null unique, order_id uuid not null unique references public.orders(id) on delete restrict,
  payment_id uuid not null unique references public.payments(id) on delete restrict, amount_received numeric(14,2) not null,
  currency text not null default 'NGN', issued_by uuid not null references public.profiles(id), issued_at timestamptz not null default now()
);

create table if not exists public.payment_audit_events (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null, actor_id uuid references public.profiles(id), event_type text not null,
  metadata jsonb not null default '{}', created_at timestamptz not null default now()
);

create or replace function public.transfer_number(prefix text) returns text language plpgsql as $$
declare candidate text; begin loop candidate := prefix || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
exit when not exists (select 1 from public.invoices where invoice_number=candidate)
and not exists (select 1 from public.receipts where receipt_number=candidate); end loop; return candidate; end $$;

alter table public.vendor_payment_settings enable row level security;
alter table public.invoices enable row level security; alter table public.payments enable row level security;
alter table public.payment_evidence enable row level security; alter table public.receipts enable row level security; alter table public.payment_audit_events enable row level security;
create policy "vendors manage own bank settings" on public.vendor_payment_settings for all to authenticated using(vendor_id=auth.uid() or public.is_admin()) with check(vendor_id=auth.uid() or public.is_admin());
create policy "customers view own invoices" on public.invoices for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid()) or public.is_admin() or exists(select 1 from public.order_items oi where oi.order_id=order_id and oi.vendor_id=auth.uid()));
create policy "customers view own payments" on public.payments for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid()) or public.is_admin() or exists(select 1 from public.order_items oi where oi.order_id=order_id and oi.vendor_id=auth.uid()));
create policy "customers view own evidence" on public.payment_evidence for select to authenticated using(uploaded_by=auth.uid() or public.is_admin() or exists(select 1 from public.order_items oi where oi.order_id=payment_evidence.order_id and oi.vendor_id=auth.uid()));
create policy "customers view own receipts" on public.receipts for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and o.customer_id=auth.uid()) or public.is_admin() or exists(select 1 from public.order_items oi where oi.order_id=receipts.order_id and oi.vendor_id=auth.uid()));
create policy "vendors view payment audit" on public.payment_audit_events for select to authenticated using(public.is_admin() or exists(select 1 from public.order_items oi where oi.order_id=payment_audit_events.order_id and oi.vendor_id=auth.uid()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('payment-evidence','payment-evidence',false,10485760,array['image/jpeg','image/png','application/pdf']) on conflict(id) do update set public=false, file_size_limit=10485760, allowed_mime_types=array['image/jpeg','image/png','application/pdf'];
create policy "customers upload own payment evidence" on storage.objects for insert to authenticated with check(bucket_id='payment-evidence' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "authorized payment evidence reads" on storage.objects for select to authenticated using(bucket_id='payment-evidence' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin() or exists(select 1 from public.payment_evidence e join public.order_items oi on oi.order_id=e.order_id where e.object_path=name and oi.vendor_id=auth.uid())));

create or replace function public.submit_transfer_evidence(order_id_input uuid, amount_input numeric, reference_input text, object_path_input text, filename_input text, mime_input text, size_input bigint)
returns public.payments language plpgsql security definer set search_path=public as $$
declare inv public.invoices; p public.payments; begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select i.* into inv from public.invoices i join public.orders o on o.id=i.order_id where i.order_id=order_id_input and o.customer_id=auth.uid() for update;
 if inv.id is null then raise exception 'Order not found'; end if; if inv.status in ('paid','cancelled','expired') then raise exception 'This invoice cannot accept payment evidence'; end if;
 if mime_input not in ('image/jpeg','image/png','application/pdf') or size_input < 1 or size_input > 10485760 then raise exception 'Unsupported evidence file'; end if;
 if object_path_input !~ ('^' || auth.uid()::text || '/') then raise exception 'Invalid evidence path'; end if;
 update public.payments set status='rejected' where order_id=order_id_input and status in ('payment_submitted','under_review');
 insert into public.payments(order_id,invoice_id,amount_claimed,transaction_reference) values(order_id_input,inv.id,amount_input,trim(reference_input)) returning * into p;
 insert into public.payment_evidence(payment_id,order_id,object_path,original_filename,mime_type,file_size,uploaded_by) values(p.id,order_id_input,object_path_input,filename_input,mime_input,size_input,auth.uid());
 update public.invoices set status='payment_submitted',updated_at=now() where id=inv.id;
 insert into public.payment_audit_events(order_id,payment_id,actor_id,event_type) values(order_id_input,p.id,auth.uid(),'evidence_submitted'); return p; end $$;

create or replace function public.verify_transfer_payment(payment_id_input uuid, amount_received_input numeric, approve boolean, rejection_reason_input text default null)
returns public.receipts language plpgsql security definer set search_path=public as $$
declare p public.payments; inv public.invoices; r public.receipts; begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select p.* into p from public.payments p where p.id=payment_id_input for update; if p.id is null then raise exception 'Payment claim not found'; end if;
 if not public.is_admin() and not exists(select 1 from public.order_items oi where oi.order_id=p.order_id and oi.vendor_id=auth.uid()) then raise exception 'Not authorized'; end if;
 if p.status not in ('payment_submitted','under_review') then raise exception 'Payment is not eligible for review'; end if;
 select * into inv from public.invoices where id=p.invoice_id for update;
 if not approve then if nullif(trim(rejection_reason_input),'') is null then raise exception 'A rejection reason is required'; end if; update public.payments set status='rejected',rejection_reason=trim(rejection_reason_input),verified_by=auth.uid(),verified_at=now(),updated_at=now() where id=p.id; insert into public.payment_audit_events(order_id,payment_id,actor_id,event_type,metadata) values(p.order_id,p.id,auth.uid(),'evidence_rejected',jsonb_build_object('reason',trim(rejection_reason_input))); return null; end if;
 if amount_received_input <> inv.amount_due then raise exception 'The received amount must exactly match the invoice amount'; end if;
 update public.payments set status='verified',amount_received=amount_received_input,verified_by=auth.uid(),verified_at=now(),updated_at=now() where id=p.id;
 update public.invoices set status='paid',updated_at=now() where id=inv.id; update public.orders set status='processing'::public.order_status,payment_status='paid'::public.payment_status,updated_at=now() where id=p.order_id;
 insert into public.receipts(receipt_number,order_id,payment_id,amount_received,currency,issued_by) values(public.transfer_number('RCP'),p.order_id,p.id,amount_received_input,inv.currency,auth.uid()) on conflict(payment_id) do update set payment_id=excluded.payment_id returning * into r;
 insert into public.payment_audit_events(order_id,payment_id,actor_id,event_type) values(p.order_id,p.id,auth.uid(),'payment_verified'); return r; end $$;

revoke all on function public.submit_transfer_evidence(uuid,numeric,text,text,text,text,bigint) from public;
grant execute on function public.submit_transfer_evidence(uuid,numeric,text,text,text,text,bigint) to authenticated;
revoke all on function public.verify_transfer_payment(uuid,numeric,boolean,text) from public;
grant execute on function public.verify_transfer_payment(uuid,numeric,boolean,text) to authenticated;

-- An invoice is created atomically with every existing place_order() order.
create or replace function public.create_transfer_invoice_for_order() returns trigger language plpgsql security definer set search_path=public as $$
declare vendor uuid; settings public.vendor_payment_settings; deadline timestamptz; begin
 select vendor_id into vendor from public.order_items where order_id=new.id limit 1;
 select * into settings from public.vendor_payment_settings where vendor_id=vendor;
 if settings.vendor_id is null then raise exception 'The vendor has not configured bank-transfer details'; end if;
 deadline := case when settings.payment_deadline_hours is null then null else new.created_at + make_interval(hours=>settings.payment_deadline_hours) end;
 insert into public.invoices(order_id,invoice_number,issued_at,due_at,amount_due,currency,billing_snapshot,bank_details_snapshot)
 values(new.id,public.transfer_number('INV'),new.created_at,deadline,new.total,new.currency,new.shipping_address,jsonb_build_object('bank_name',settings.bank_name,'account_name',settings.account_name,'account_number',settings.account_number,'instructions',settings.payment_instructions));
 return new; end $$;
drop trigger if exists create_transfer_invoice_after_order on public.orders;
create constraint trigger create_transfer_invoice_after_order
after insert on public.orders deferrable initially deferred
for each row execute procedure public.create_transfer_invoice_for_order();
