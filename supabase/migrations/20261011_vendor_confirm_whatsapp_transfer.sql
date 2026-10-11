-- Customers send transfer proof by WhatsApp. This trusted operation lets the
-- authorised vendor settle an issued invoice only after checking their bank.
create or replace function public.confirm_invoice_transfer_payment(
  invoice_id_input uuid,
  amount_received_input numeric
)
returns public.receipts
language plpgsql security definer set search_path = public
as $$
declare
  inv public.invoices;
  payment_record public.payments;
  receipt_record public.receipts;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into inv from public.invoices where id = invoice_id_input for update;
  if inv.id is null then raise exception 'Invoice not found'; end if;
  if not public.is_admin() and not exists (
    select 1 from public.order_items where order_id = inv.order_id and vendor_id = auth.uid()
  ) then raise exception 'Not authorized'; end if;
  if inv.status <> 'issued' then raise exception 'This invoice is not awaiting payment'; end if;
  if amount_received_input <> inv.amount_due then raise exception 'The received amount must exactly match the invoice amount'; end if;

  insert into public.payments(order_id, invoice_id, amount_claimed, amount_received, transaction_reference, status, verified_by, verified_at)
  values(inv.order_id, inv.id, amount_received_input, amount_received_input, 'Verified by vendor after WhatsApp proof', 'verified', auth.uid(), now())
  returning * into payment_record;

  update public.invoices set status = 'paid', updated_at = now() where id = inv.id;
  update public.orders set status = 'processing'::public.order_status, payment_status = 'paid'::public.payment_status, updated_at = now() where id = inv.order_id;
  insert into public.receipts(receipt_number, order_id, payment_id, amount_received, currency, issued_by)
  values(public.transfer_number('RCP'), inv.order_id, payment_record.id, amount_received_input, inv.currency, auth.uid())
  returning * into receipt_record;
  insert into public.payment_audit_events(order_id, payment_id, actor_id, event_type, metadata)
  values(inv.order_id, payment_record.id, auth.uid(), 'payment_verified', jsonb_build_object('proof_channel', 'whatsapp'));
  return receipt_record;
end;
$$;

revoke all on function public.confirm_invoice_transfer_payment(uuid, numeric) from public;
grant execute on function public.confirm_invoice_transfer_payment(uuid, numeric) to authenticated;
