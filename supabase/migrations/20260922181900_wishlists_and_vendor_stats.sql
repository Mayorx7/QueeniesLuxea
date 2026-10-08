-- Migration: Wishlists and Vendor Stats
-- Creates the wishlists table for persistence and the vendor_get_stats RPC.

-- 1. Wishlists Table
create table if not exists public.wishlists (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null, -- Stores product ID (uuid or legacy string ID)
  created_at timestamp with time zone not null default now()
);

create index wishlists_user_id_idx on public.wishlists(user_id);
create unique index wishlists_user_product_idx on public.wishlists(user_id, product_id);

alter table public.wishlists enable row level security;

create policy "Customers can view own wishlists" 
  on public.wishlists for select 
  using (auth.uid() = user_id);

create policy "Customers can insert own wishlists" 
  on public.wishlists for insert 
  with check (auth.uid() = user_id);

create policy "Customers can delete own wishlists" 
  on public.wishlists for delete 
  using (auth.uid() = user_id);


-- 2. Vendor Stats RPC
create or replace function public.vendor_get_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_vendor_id uuid := auth.uid();
  v_total_sales numeric(14,2) := 0;
  v_total_orders bigint := 0;
  v_total_products bigint := 0;
  result jsonb;
begin
  if v_vendor_id is null then
    raise exception 'Authentication required';
  end if;

  -- 1. Total Sales & Total Earnings (Currently equal, no commission fee applied yet)
  select coalesce(sum(total_price), 0)
  into v_total_sales
  from public.order_items
  where vendor_id = v_vendor_id
    and item_status not in ('cancelled', 'refunded');

  -- 2. Total Orders (distinct orders containing this vendor's items)
  select count(distinct order_id)
  into v_total_orders
  from public.order_items
  where vendor_id = v_vendor_id
    and item_status not in ('cancelled', 'refunded');

  -- 3. Total Products
  select count(*)
  into v_total_products
  from public.products
  where vendor_id = v_vendor_id;

  result := jsonb_build_object(
    'total_sales', v_total_sales,
    'total_orders', v_total_orders,
    'total_products', v_total_products,
    'total_earnings', v_total_sales
  );

  return result;
end;
$$;

revoke all on function public.vendor_get_stats() from public;
grant execute on function public.vendor_get_stats() to authenticated;
