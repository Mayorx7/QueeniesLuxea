-- Storage policies for private payment evidence check whether a vendor owns an
-- order item. The authenticated role needs this table permission before
-- PostgreSQL can evaluate that policy, including during product-image uploads.
-- Row Level Security continues to limit users to the rows they are allowed to see.
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;
