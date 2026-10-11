-- RLS policies do not grant table privileges by themselves.
-- Allow authenticated users to reach these tables; RLS still enforces row-level access.
grant select, insert, update on public.vendor_payment_settings to authenticated;
grant select on public.invoices to authenticated;
grant select on public.payments to authenticated;
grant select on public.payment_evidence to authenticated;
grant select on public.receipts to authenticated;
grant select on public.payment_audit_events to authenticated;
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;

-- Sequence privileges are harmless for UUID-default tables but needed by some PostgREST setups.
grant usage on schema public to authenticated;
