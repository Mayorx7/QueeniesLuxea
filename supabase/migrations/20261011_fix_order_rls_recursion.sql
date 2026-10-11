-- Fix recursive RLS evaluation when orders are queried with order_items(count).
-- Uses narrowly scoped security-definer helpers instead of policies querying each other.

create or replace function public.is_order_customer(order_id_input uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.orders where id = order_id_input and customer_id = auth.uid());
$$;

create or replace function public.is_order_vendor(order_id_input uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.order_items where order_id = order_id_input and vendor_id = auth.uid());
$$;

revoke all on function public.is_order_customer(uuid) from public;
revoke all on function public.is_order_vendor(uuid) from public;
grant execute on function public.is_order_customer(uuid) to authenticated;
grant execute on function public.is_order_vendor(uuid) to authenticated;

drop policy if exists "customers read own orders" on public.orders;
drop policy if exists "vendors read orders with their items" on public.orders;
drop policy if exists "admins read all orders" on public.orders;
create policy "customers read own orders" on public.orders for select to authenticated using (customer_id = auth.uid());
create policy "vendors read orders with their items" on public.orders for select to authenticated using (public.is_order_vendor(id));
create policy "admins read all orders" on public.orders for select to authenticated using (public.is_admin());

drop policy if exists "customers read own order items" on public.order_items;
drop policy if exists "vendors read own order items" on public.order_items;
drop policy if exists "admins read all order items" on public.order_items;
create policy "customers read own order items" on public.order_items for select to authenticated using (public.is_order_customer(order_id));
create policy "vendors read own order items" on public.order_items for select to authenticated using (vendor_id = auth.uid());
create policy "admins read all order items" on public.order_items for select to authenticated using (public.is_admin());
