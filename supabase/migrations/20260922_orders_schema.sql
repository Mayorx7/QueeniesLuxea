-- =============================================================================
-- Migration: Orders & Order Items
-- Date: 2026-09-22
-- Depends on: 20260911_secure_auth.sql   (profiles, is_admin, handle_updated_at)
--             20260915_products_schema.sql (products, product_variants)
--
-- Tables created:
--   public.orders
--   public.order_items
--
-- RPCs exposed to authenticated users:
--   public.place_order(...)                             -- customers; atomic cart → order
--   public.cancel_order(uuid)                           -- customers; cancel own pending order
--   public.admin_update_order_status(uuid, order_status)
--   public.vendor_update_order_item_status(uuid, order_item_status, text)
--   public.get_order_with_items(uuid)                   -- returns order + items as JSONB
-- =============================================================================


-- ─────────────────────────────────────────────
-- 1. ENUMS
-- ─────────────────────────────────────────────

do $$ begin
  create type public.order_status as enum (
    'pending',      -- placed, awaiting payment confirmation
    'confirmed',    -- payment confirmed
    'processing',   -- being packed / prepared
    'shipped',      -- handed to courier
    'delivered',    -- received by customer
    'cancelled',    -- cancelled before shipment
    'refunded'      -- refund issued
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum (
    'pending',
    'paid',
    'failed',
    'refunded'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.delivery_method as enum (
    'standard',   -- 5–8 business days
    'express',    -- 2–3 business days
    'overnight'   -- next business day
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  -- Per-line fulfilment status (each vendor fulfils their own items)
  create type public.order_item_status as enum (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  );
exception
  when duplicate_object then null;
end $$;


-- ─────────────────────────────────────────────
-- 2. ORDERS TABLE
-- ─────────────────────────────────────────────

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),

  -- Customer who placed the order
  customer_id         uuid not null references public.profiles(id) on delete restrict,

  -- Human-readable code shown in emails and the UI  (e.g. QL-A3F9K2)
  order_number        text not null unique,

  -- Lifecycle
  status              public.order_status   not null default 'pending',
  payment_status      public.payment_status not null default 'pending',

  -- Delivery
  delivery_method     public.delivery_method not null default 'standard',

  -- Address snapshots at purchase time (JSON survives future profile edits)
  shipping_address    jsonb not null,
  billing_address     jsonb,                         -- defaults to shipping when null

  -- Financials — all amounts are in Nigerian Naira (NGN) by default.
  -- Stored as exact numeric to avoid floating-point rounding errors.
  currency            text          not null default 'NGN',
  subtotal            numeric(14,2) not null default 0 check (subtotal >= 0),
  shipping_fee        numeric(14,2) not null default 0 check (shipping_fee >= 0),
  discount_amount     numeric(14,2) not null default 0 check (discount_amount >= 0),
  total               numeric(14,2) not null default 0 check (total >= 0),

  -- Optional promo code applied at checkout
  coupon_code         text,

  -- Payment gateway reference (Stripe payment_intent, Paystack ref, etc.)
  payment_reference   text,

  -- Free-text note from customer
  customer_note       text,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);


-- ─────────────────────────────────────────────
-- 3. ORDER ITEMS TABLE
-- ─────────────────────────────────────────────
-- Every cart line becomes one row here.
-- Product & price data is SNAPSHOTTED at purchase so later catalogue
-- changes never corrupt historical records.

create table if not exists public.order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders(id) on delete cascade,

  -- Denormalised: which vendor owns this line item
  vendor_id           uuid not null references public.profiles(id) on delete restrict,

  -- Live FKs (nullable — product/variant may be deleted post-purchase)
  product_id          uuid references public.products(id) on delete set null,
  variant_id          uuid references public.product_variants(id) on delete set null,

  -- ── Immutable snapshots ─────────────────────────────────────────────
  product_name        text not null,
  product_image_url   text,
  sku                 text,
  color               text,
  size                text,
  -- ────────────────────────────────────────────────────────────────────

  quantity            integer      not null default 1 check (quantity > 0),
  unit_price          numeric(14,2) not null check (unit_price >= 0),
  total_price         numeric(14,2) not null check (total_price >= 0),

  -- Per-item fulfilment (vendor fulfils their own lines independently)
  item_status         public.order_item_status not null default 'pending',
  tracking_number     text,
  shipped_at          timestamptz,
  delivered_at        timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);


-- ─────────────────────────────────────────────
-- 4. INDEXES
-- ─────────────────────────────────────────────

create index if not exists idx_orders_customer_id
  on public.orders (customer_id);

create index if not exists idx_orders_created_at
  on public.orders (created_at desc);

create index if not exists idx_orders_status
  on public.orders (status);

create index if not exists idx_order_items_order_id
  on public.order_items (order_id);

create index if not exists idx_order_items_vendor_id
  on public.order_items (vendor_id);


-- ─────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- ── ORDERS ──────────────────────────────────

-- Customers: read their own orders
drop policy if exists "customers read own orders" on public.orders;
create policy "customers read own orders" on public.orders
  for select to authenticated
  using (customer_id = auth.uid());

-- Vendors: read orders that contain at least one of their items
drop policy if exists "vendors read orders with their items" on public.orders;
create policy "vendors read orders with their items" on public.orders
  for select to authenticated
  using (
    exists (
      select 1 from public.order_items
      where order_items.order_id = orders.id
        and order_items.vendor_id = auth.uid()
    )
  );

-- Admins: full read access
drop policy if exists "admins read all orders" on public.orders;
create policy "admins read all orders" on public.orders
  for select to authenticated
  using (public.is_admin());


-- ── ORDER ITEMS ──────────────────────────────

-- Customers: read items on their own orders
drop policy if exists "customers read own order items" on public.order_items;
create policy "customers read own order items" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.customer_id = auth.uid()
    )
  );

-- Vendors: read items that belong to their store
drop policy if exists "vendors read own order items" on public.order_items;
create policy "vendors read own order items" on public.order_items
  for select to authenticated
  using (vendor_id = auth.uid());

-- Admins: full read access
drop policy if exists "admins read all order items" on public.order_items;
create policy "admins read all order items" on public.order_items
  for select to authenticated
  using (public.is_admin());


-- ─────────────────────────────────────────────
-- 6. UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────────
-- public.handle_updated_at() was defined in 20260915_products_schema.sql.

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_order_items_updated_at on public.order_items;
create trigger set_order_items_updated_at
  before update on public.order_items
  for each row execute procedure public.handle_updated_at();


-- ─────────────────────────────────────────────
-- 7. HELPER: ORDER NUMBER GENERATOR
-- ─────────────────────────────────────────────
-- Produces a short, unambiguous code: QL-A3F9K2
-- Not exposed directly; called inside place_order().

create or replace function public.generate_order_number()
returns text language plpgsql as $$
declare
  chars     text    := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- omits I, O, 1, 0
  candidate text;
  seg       text;
  i         integer;
begin
  loop
    seg := '';
    for i in 1..6 loop
      seg := seg || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    candidate := 'QL-' || seg;
    exit when not exists (select 1 from public.orders where order_number = candidate);
  end loop;
  return candidate;
end;
$$;


-- ─────────────────────────────────────────────
-- 8. RPC: place_order
-- ─────────────────────────────────────────────
-- Atomically turns a cart into a persisted order.
-- Decrements product_variants.stock for every matched variant.
-- Returns the created order row.
--
-- cart_items  — JSONB array, each element:
-- {
--   "product_id":        "<uuid>",
--   "variant_id":        "<uuid|null>",
--   "vendor_id":         "<uuid>",
--   "product_name":      "Ivory Silk Wrap Dress",
--   "product_image_url": "https://...",
--   "sku":               "DR-001-IVY",
--   "color":             "Ivory",
--   "size":              "S",
--   "quantity":          2,
--   "unit_price":        149.99
-- }
--
-- shipping_address_input — JSONB:
-- { "first_name":"...", "last_name":"...", "address":"...",
--   "city":"...", "state":"...", "postcode":"...", "country":"..." }

create or replace function public.place_order(
  cart_items              jsonb,
  shipping_address_input  jsonb,
  billing_address_input   jsonb    default null,
  delivery_method_input   text     default 'standard',
  coupon_code_input       text     default null,
  customer_note_input     text     default null,
  payment_reference_input text     default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order     public.orders;
  item          jsonb;
  v_unit_price  numeric(14,2);
  v_quantity    integer;
  v_variant_id  uuid;
  calc_subtotal numeric(14,2) := 0;
  calc_shipping numeric(14,2);
  calc_discount numeric(14,2) := 0;
  calc_total    numeric(14,2);

  FREE_THRESHOLD  constant numeric := 150.00;
  FEE_STANDARD    constant numeric := 14.00;
  FEE_EXPRESS     constant numeric := 18.00;
  FEE_OVERNIGHT   constant numeric := 38.00;
begin
  -- Auth guard
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  -- Cart must not be empty
  if jsonb_array_length(cart_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  -- ── Compute subtotal ─────────────────────────────────────────────────
  for item in select * from jsonb_array_elements(cart_items) loop
    v_unit_price := (item->>'unit_price')::numeric;
    v_quantity   := (item->>'quantity')::integer;
    if v_unit_price < 0 or v_quantity < 1 then
      raise exception 'Invalid item: price or quantity out of range';
    end if;
    calc_subtotal := calc_subtotal + v_unit_price * v_quantity;
  end loop;

  -- ── Compute shipping fee ─────────────────────────────────────────────
  if calc_subtotal >= FREE_THRESHOLD then
    calc_shipping := 0;
  elsif delivery_method_input = 'express' then
    calc_shipping := FEE_EXPRESS;
  elsif delivery_method_input = 'overnight' then
    calc_shipping := FEE_OVERNIGHT;
  else
    calc_shipping := FEE_STANDARD;
  end if;

  calc_total := calc_subtotal + calc_shipping - calc_discount;

  -- ── Insert order header ──────────────────────────────────────────────
  insert into public.orders (
    customer_id, order_number, status, payment_status,
    delivery_method, shipping_address, billing_address,
    subtotal, shipping_fee, discount_amount, total,
    coupon_code, payment_reference, customer_note
  ) values (
    auth.uid(),
    public.generate_order_number(),
    'pending',
    case when payment_reference_input is not null then 'paid' else 'pending' end,
    delivery_method_input::public.delivery_method,
    shipping_address_input,
    coalesce(billing_address_input, shipping_address_input),
    calc_subtotal,
    calc_shipping,
    calc_discount,
    calc_total,
    coupon_code_input,
    payment_reference_input,
    customer_note_input
  )
  returning * into new_order;

  -- ── Insert line items & decrement stock ──────────────────────────────
  for item in select * from jsonb_array_elements(cart_items) loop
    v_unit_price := (item->>'unit_price')::numeric;
    v_quantity   := (item->>'quantity')::integer;
    v_variant_id := nullif(item->>'variant_id', '')::uuid;

    insert into public.order_items (
      order_id, vendor_id, product_id, variant_id,
      product_name, product_image_url, sku, color, size,
      quantity, unit_price, total_price, item_status
    ) values (
      new_order.id,
      (item->>'vendor_id')::uuid,
      nullif(item->>'product_id', '')::uuid,
      v_variant_id,
      item->>'product_name',
      item->>'product_image_url',
      item->>'sku',
      item->>'color',
      item->>'size',
      v_quantity,
      v_unit_price,
      v_unit_price * v_quantity,
      'pending'
    );

    -- Stock decrement (only when a variant_id is known)
    if v_variant_id is not null then
      update public.product_variants
      set stock = greatest(stock - v_quantity, 0)
      where id = v_variant_id;
    end if;
  end loop;

  return new_order;
end;
$$;

revoke all on function
  public.place_order(jsonb, jsonb, jsonb, text, text, text, text) from public;
grant execute on function
  public.place_order(jsonb, jsonb, jsonb, text, text, text, text) to authenticated;


-- ─────────────────────────────────────────────
-- 9. RPC: cancel_order
-- ─────────────────────────────────────────────
-- Customers cancel only while the order is 'pending' or 'confirmed'.
-- Variant stock is restored.

create or replace function public.cancel_order(order_id_input uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.orders;
  item         record;
begin
  -- Fetch & lock the order, verifying ownership
  select * into target_order
  from public.orders
  where id = order_id_input and customer_id = auth.uid()
  for update;

  if target_order is null then
    raise exception 'Order not found or does not belong to you';
  end if;

  if target_order.status not in ('pending', 'confirmed') then
    raise exception 'Cannot cancel an order with status: %', target_order.status;
  end if;

  -- Restore stock for all variant line items
  for item in
    select variant_id, quantity
    from public.order_items
    where order_id = order_id_input and variant_id is not null
  loop
    update public.product_variants
    set stock = stock + item.quantity
    where id = item.variant_id;
  end loop;

  -- Update order and all its items
  update public.orders
  set status = 'cancelled', updated_at = now()
  where id = order_id_input
  returning * into target_order;

  update public.order_items
  set item_status = 'cancelled', updated_at = now()
  where order_id = order_id_input;

  return target_order;
end;
$$;

revoke all on function public.cancel_order(uuid) from public;
grant execute on function public.cancel_order(uuid) to authenticated;


-- ─────────────────────────────────────────────
-- 10. RPC: admin_update_order_status
-- ─────────────────────────────────────────────

create or replace function public.admin_update_order_status(
  order_id_input   uuid,
  new_status_input public.order_status
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_order public.orders;
  item          record;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can update order status';
  end if;

  -- Restore stock on refund
  if new_status_input = 'refunded' then
    for item in
      select variant_id, quantity
      from public.order_items
      where order_id = order_id_input and variant_id is not null
    loop
      update public.product_variants
      set stock = stock + item.quantity
      where id = item.variant_id;
    end loop;
  end if;

  update public.orders
  set status = new_status_input, updated_at = now()
  where id = order_id_input
  returning * into updated_order;

  if updated_order is null then
    raise exception 'Order not found: %', order_id_input;
  end if;

  return updated_order;
end;
$$;

revoke all on function public.admin_update_order_status(uuid, public.order_status) from public;
grant execute on function public.admin_update_order_status(uuid, public.order_status) to authenticated;


-- ─────────────────────────────────────────────
-- 11. RPC: vendor_update_order_item_status
-- ─────────────────────────────────────────────

create or replace function public.vendor_update_order_item_status(
  item_id_input         uuid,
  new_status_input      public.order_item_status,
  tracking_number_input text default null
)
returns public.order_items
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_item public.order_items;
begin
  if not exists (
    select 1 from public.order_items
    where id = item_id_input and vendor_id = auth.uid()
  ) then
    raise exception 'Order item not found or does not belong to your store';
  end if;

  update public.order_items
  set
    item_status     = new_status_input,
    tracking_number = coalesce(tracking_number_input, tracking_number),
    shipped_at      = case when new_status_input = 'shipped'   then now() else shipped_at   end,
    delivered_at    = case when new_status_input = 'delivered' then now() else delivered_at end,
    updated_at      = now()
  where id = item_id_input
  returning * into updated_item;

  return updated_item;
end;
$$;

revoke all on function public.vendor_update_order_item_status(uuid, public.order_item_status, text) from public;
grant execute on function public.vendor_update_order_item_status(uuid, public.order_item_status, text) to authenticated;


-- ─────────────────────────────────────────────
-- 12. RPC: get_order_with_items
-- ─────────────────────────────────────────────
-- Returns one order + all its items as a JSONB object.
-- Accessible by the owning customer, any vendor on that order, or any admin.

create or replace function public.get_order_with_items(order_id_input uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result    jsonb;
  caller_id uuid := auth.uid();
begin
  if not (
    exists (select 1 from public.orders where id = order_id_input and customer_id = caller_id)
    or exists (select 1 from public.order_items where order_id = order_id_input and vendor_id = caller_id)
    or public.is_admin()
  ) then
    raise exception 'Access denied';
  end if;

  select jsonb_build_object(
    'order', row_to_json(o)::jsonb,
    'items', coalesce(
      (
        select jsonb_agg(row_to_json(i)::jsonb order by i.created_at)
        from public.order_items i
        where i.order_id = o.id
      ),
      '[]'::jsonb
    )
  )
  into result
  from public.orders o
  where o.id = order_id_input;

  return result;
end;
$$;

revoke all on function public.get_order_with_items(uuid) from public;
grant execute on function public.get_order_with_items(uuid) to authenticated;
