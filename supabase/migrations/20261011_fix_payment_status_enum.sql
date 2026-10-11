-- Fix enum assignments in the existing order and bank-transfer functions.
-- CASE expressions are text unless explicitly cast, while orders.payment_status
-- is the public.payment_status enum.

create or replace function public.place_order(
  cart_items jsonb,
  shipping_address_input jsonb,
  billing_address_input jsonb default null,
  delivery_method_input text default 'standard',
  coupon_code_input text default null,
  customer_note_input text default null,
  payment_reference_input text default null
)
returns public.orders
language plpgsql security definer set search_path = public
as $$
declare
  new_order public.orders; item jsonb; v_unit_price numeric(14,2); v_quantity integer; v_variant_id uuid;
  calc_subtotal numeric(14,2) := 0; calc_shipping numeric(14,2); calc_discount numeric(14,2) := 0; calc_total numeric(14,2);
  free_threshold constant numeric := 150.00; fee_standard constant numeric := 14.00; fee_express constant numeric := 18.00; fee_overnight constant numeric := 38.00;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if jsonb_array_length(cart_items) = 0 then raise exception 'Cart is empty'; end if;
  for item in select * from jsonb_array_elements(cart_items) loop
    v_unit_price := (item->>'unit_price')::numeric; v_quantity := (item->>'quantity')::integer;
    if v_unit_price < 0 or v_quantity < 1 then raise exception 'Invalid item: price or quantity out of range'; end if;
    calc_subtotal := calc_subtotal + v_unit_price * v_quantity;
  end loop;
  if calc_subtotal >= free_threshold then calc_shipping := 0;
  elsif delivery_method_input = 'express' then calc_shipping := fee_express;
  elsif delivery_method_input = 'overnight' then calc_shipping := fee_overnight;
  else calc_shipping := fee_standard; end if;
  calc_total := calc_subtotal + calc_shipping - calc_discount;
  insert into public.orders (customer_id,order_number,status,payment_status,delivery_method,shipping_address,billing_address,subtotal,shipping_fee,discount_amount,total,coupon_code,payment_reference,customer_note)
  values (auth.uid(),public.generate_order_number(),'pending'::public.order_status,(case when payment_reference_input is not null then 'paid' else 'pending' end)::public.payment_status,delivery_method_input::public.delivery_method,shipping_address_input,coalesce(billing_address_input,shipping_address_input),calc_subtotal,calc_shipping,calc_discount,calc_total,coupon_code_input,payment_reference_input,customer_note_input)
  returning * into new_order;
  for item in select * from jsonb_array_elements(cart_items) loop
    v_unit_price := (item->>'unit_price')::numeric; v_quantity := (item->>'quantity')::integer; v_variant_id := nullif(item->>'variant_id','')::uuid;
    insert into public.order_items (order_id,vendor_id,product_id,variant_id,product_name,product_image_url,sku,color,size,quantity,unit_price,total_price,item_status)
    values (new_order.id,(item->>'vendor_id')::uuid,nullif(item->>'product_id','')::uuid,v_variant_id,item->>'product_name',item->>'product_image_url',item->>'sku',item->>'color',item->>'size',v_quantity,v_unit_price,v_unit_price*v_quantity,'pending'::public.order_item_status);
    if v_variant_id is not null then update public.product_variants set stock=greatest(stock-v_quantity,0) where id=v_variant_id; end if;
  end loop;
  return new_order;
end;
$$;

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
 update public.invoices set status='paid',updated_at=now() where id=inv.id;
 update public.orders set status='processing'::public.order_status,payment_status='paid'::public.payment_status,updated_at=now() where id=p.order_id;
 insert into public.receipts(receipt_number,order_id,payment_id,amount_received,currency,issued_by) values(public.transfer_number('RCP'),p.order_id,p.id,amount_received_input,inv.currency,auth.uid()) on conflict(payment_id) do update set payment_id=excluded.payment_id returning * into r;
 insert into public.payment_audit_events(order_id,payment_id,actor_id,event_type) values(p.order_id,p.id,auth.uid(),'payment_verified'); return r;
end;
$$;

revoke all on function public.place_order(jsonb,jsonb,jsonb,text,text,text,text) from public;
grant execute on function public.place_order(jsonb,jsonb,jsonb,text,text,text,text) to authenticated;
revoke all on function public.verify_transfer_payment(uuid,numeric,boolean,text) from public;
grant execute on function public.verify_transfer_payment(uuid,numeric,boolean,text) to authenticated;
