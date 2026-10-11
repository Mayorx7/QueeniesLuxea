-- =============================================================================
-- Migration: Offers & Promotions System
-- Date: 2026-10-10
-- Depends on: 20260911_secure_auth.sql (profiles, is_admin)
--             20260915_products_schema.sql (products)
--
-- Tables created:
--   public.offers
--   public.offer_images
--   public.offer_pricing_tiers
--
-- Features:
--   - FYB & Campus Deals (customized university outfits)
--   - Wholesale Deals (quantity-based pricing)
--   - Special Promotions (discounts, bundles, limited-time)
-- =============================================================================

-- ─────────────────────────────────────────────
-- 1. ENUMS
-- ─────────────────────────────────────────────

do $$ begin
  create type public.offer_type as enum (
    'fyb_campus',      -- FYB & Campus Deals
    'wholesale',       -- Wholesale Deals
    'special_promo'    -- Special Promotions
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.offer_status as enum (
    'draft',           -- Not published
    'scheduled',       -- Scheduled for future
    'active',          -- Currently active
    'paused',          -- Temporarily paused
    'expired'          -- Past expiry date
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.discount_type as enum (
    'none',
    'percentage',     -- e.g., 20% off
    'fixed_amount',   -- e.g., ₦5,000 off
    'fixed_price'     -- Override price entirely
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.ordering_method as enum (
    'checkout',        -- Standard website checkout
    'whatsapp',        -- WhatsApp enquiry/order
    'both'             -- Both options available
  );
exception
  when duplicate_object then null;
end $$;

-- ─────────────────────────────────────────────
-- 2. OFFERS TABLE
-- ─────────────────────────────────────────────

create table if not exists public.offers (
  id                  uuid primary key default gen_random_uuid(),
  vendor_id           uuid not null references public.profiles(id) on delete cascade,

  -- Basic info
  title               text not null,
  slug                text not null unique,
  description         text,
  offer_type          public.offer_type not null,

  -- FYB subcategory (for FYB & Campus deals)
  subcategory         text, -- e.g., 'jackets', 'denim', 'corporate_wear', etc.

  -- Pricing
  original_price      numeric(14,2),           -- Regular price (if applicable)
  offer_price         numeric(14,2),           -- Special offer price
  discount_type       public.discount_type default 'none',
  discount_value      numeric(14,2),           -- Percentage or fixed amount

  -- Quantity constraints
  min_quantity        integer default 1 check (min_quantity >= 1),
  max_quantity        integer check (max_quantity > min_quantity),

  -- Dates
  start_date          timestamptz,
  expiry_date         timestamptz,

  -- Customization (for FYB/Campus deals)
  customization_info  jsonb default '{}',
  -- Example: { "university": "UNILAG", "department": "Computer Science", "min_group_size": 10 }

  -- Fulfilment
  ordering_method     public.ordering_method default 'checkout',
  fulfilment_notes    text,

  -- Publication
  status              public.offer_status default 'draft',
  is_featured         boolean default false,

  -- Linked products (for checkout-based offers)
  linked_product_ids  uuid[] default '{}',

  -- Metadata
  tags                text[] default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 3. OFFER IMAGES TABLE
-- ─────────────────────────────────────────────

create table if not exists public.offer_images (
  id                  uuid primary key default gen_random_uuid(),
  offer_id            uuid not null references public.offers(id) on delete cascade,
  url                 text not null,
  display_order       integer default 0,
  created_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 4. OFFER PRICING TIERS TABLE (for wholesale)
-- ─────────────────────────────────────────────

create table if not exists public.offer_pricing_tiers (
  id                  uuid primary key default gen_random_uuid(),
  offer_id            uuid not null references public.offers(id) on delete cascade,
  min_quantity        integer not null check (min_quantity >= 1),
  max_quantity        integer check (max_quantity > min_quantity),
  price_per_unit      numeric(14,2) not null check (price_per_unit >= 0),
  created_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 5. INDEXES
-- ─────────────────────────────────────────────

create index if not exists idx_offers_vendor_id
  on public.offers (vendor_id);

create index if not exists idx_offers_slug
  on public.offers (slug);

create index if not exists idx_offers_status
  on public.offers (status);

create index if not exists idx_offers_is_featured
  on public.offers (is_featured) where is_featured = true;

create index if not exists idx_offers_dates
  on public.offers (start_date, expiry_date);

create index if not exists idx_offer_images_offer_id
  on public.offer_images (offer_id);

create index if not exists idx_offer_pricing_tiers_offer_id
  on public.offer_pricing_tiers (offer_id);

-- ─────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

alter table public.offers enable row level security;
alter table public.offer_images enable row level security;
alter table public.offer_pricing_tiers enable row level security;

-- ── OFFERS ──────────────────────────────────

-- Public: view published, active, non-expired offers
drop policy if exists "public can view active offers" on public.offers;
create policy "public can view active offers" on public.offers
  for select to anon, authenticated
  using (
    status = 'active'
    and (start_date is null or start_date <= now())
    and (expiry_date is null or expiry_date > now())
  );

-- Vendors: view their own offers (all statuses)
drop policy if exists "vendors can view their own offers" on public.offers;
create policy "vendors can view their own offers" on public.offers
  for select to authenticated
  using (auth.uid() = vendor_id);

-- Vendors: insert their own offers
drop policy if exists "vendors can insert their own offers" on public.offers;
create policy "vendors can insert their own offers" on public.offers
  for insert to authenticated
  with check (auth.uid() = vendor_id);

-- Vendors: update their own offers
drop policy if exists "vendors can update their own offers" on public.offers;
create policy "vendors can update their own offers" on public.offers
  for update to authenticated
  using (auth.uid() = vendor_id)
  with check (auth.uid() = vendor_id);

-- Vendors: delete their own offers
drop policy if exists "vendors can delete their own offers" on public.offers;
create policy "vendors can delete their own offers" on public.offers
  for delete to authenticated
  using (auth.uid() = vendor_id);

-- Admins: full access
drop policy if exists "admins can manage all offers" on public.offers;
create policy "admins can manage all offers" on public.offers
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── OFFER IMAGES ─────────────────────────────

-- Public: view images for active offers
drop policy if exists "public can view active offer images" on public.offer_images;
create policy "public can view active offer images" on public.offer_images
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.offers
      where offers.id = offer_images.offer_id
        and offers.status = 'active'
        and (offers.start_date is null or offers.start_date <= now())
        and (offers.expiry_date is null or offers.expiry_date > now())
    )
  );

-- Vendors: manage images for their offers
drop policy if exists "vendors can manage their offer images" on public.offer_images;
create policy "vendors can manage their offer images" on public.offer_images
  for all to authenticated
  using (
    exists (
      select 1 from public.offers
      where offers.id = offer_images.offer_id
        and offers.vendor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.offers
      where offers.id = offer_images.offer_id
        and offers.vendor_id = auth.uid()
    )
  );

-- Admins: full access
drop policy if exists "admins can manage all offer images" on public.offer_images;
create policy "admins can manage all offer images" on public.offer_images
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── OFFER PRICING TIERS ───────────────────────

-- Public: view pricing tiers for active offers
drop policy if exists "public can view active offer pricing tiers" on public.offer_pricing_tiers;
create policy "public can view active offer pricing tiers" on public.offer_pricing_tiers
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.offers
      where offers.id = offer_pricing_tiers.offer_id
        and offers.status = 'active'
        and (offers.start_date is null or offers.start_date <= now())
        and (offers.expiry_date is null or offers.expiry_date > now())
    )
  );

-- Vendors: manage pricing tiers for their offers
drop policy if exists "vendors can manage their offer pricing tiers" on public.offer_pricing_tiers;
create policy "vendors can manage their offer pricing tiers" on public.offer_pricing_tiers
  for all to authenticated
  using (
    exists (
      select 1 from public.offers
      where offers.id = offer_pricing_tiers.offer_id
        and offers.vendor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.offers
      where offers.id = offer_pricing_tiers.offer_id
        and offers.vendor_id = auth.uid()
    )
  );

-- Admins: full access
drop policy if exists "admins can manage all offer pricing tiers" on public.offer_pricing_tiers;
create policy "admins can manage all offer pricing tiers" on public.offer_pricing_tiers
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────
-- 7. UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────────

drop trigger if exists set_offers_updated_at on public.offers;
create trigger set_offers_updated_at
  before update on public.offers
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────────
-- 8. HELPER: SLUG GENERATOR
-- ─────────────────────────────────────────────

create or replace function public.generate_offer_slug(title_input text)
returns text language plpgsql as $$
declare
  base_slug text;
  candidate text;
  counter integer := 0;
begin
  base_slug := lower(regexp_replace(title_input, '[^a-z0-9]+', '-', 'gi'));
  base_slug := regexp_replace(base_slug, '^-|-$', '', 'g');
  
  loop
    if counter = 0 then
      candidate := base_slug;
    else
      candidate := base_slug || '-' || counter::text;
    end if;
    
    exit when not exists (select 1 from public.offers where slug = candidate);
    counter := counter + 1;
  end loop;
  
  return candidate;
end;
$$;

-- ─────────────────────────────────────────────
-- 9. HELPER: OFFER STATUS CALCULATOR
-- ─────────────────────────────────────────────
-- Automatically calculates offer status based on dates and manual status

create or replace function public.calculate_offer_status()
returns trigger language plpgsql as $$
begin
  -- If manually set to draft or paused, respect it
  if new.status in ('draft', 'paused') then
    return new;
  end if;
  
  -- Check expiry
  if new.expiry_date is not null and new.expiry_date <= now() then
    new.status := 'expired';
  -- Check if scheduled for future
  elsif new.start_date is not null and new.start_date > now() then
    new.status := 'scheduled';
  -- Otherwise, if published, it's active
  elsif new.status = 'published' or new.status = 'active' then
    new.status := 'active';
  end if;
  
  return new;
end;
$$;

drop trigger if exists calculate_offer_status_trigger on public.offers;
create trigger calculate_offer_status_trigger
  before insert or update on public.offers
  for each row execute procedure public.calculate_offer_status();

-- ─────────────────────────────────────────────
-- 10. RPC: GET FEATURED OFFERS
-- ─────────────────────────────────────────────

create or replace function public.get_featured_offers(limit_count integer default 10)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_agg(
    jsonb_build_object(
      'id', o.id,
      'title', o.title,
      'slug', o.slug,
      'description', o.description,
      'offer_type', o.offer_type,
      'original_price', o.original_price,
      'offer_price', o.offer_price,
      'discount_type', o.discount_type,
      'discount_value', o.discount_value,
      'min_quantity', o.min_quantity,
      'start_date', o.start_date,
      'expiry_date', o.expiry_date,
      'images', (
        select jsonb_agg(
          jsonb_build_object(
            'url', oi.url,
            'display_order', oi.display_order
          ) order by oi.display_order
        )
        from public.offer_images oi
        where oi.offer_id = o.id
      )
    )
  ) into result
  from public.offers o
  where o.is_featured = true
    and o.status = 'active'
    and (o.start_date is null or o.start_date <= now())
    and (o.expiry_date is null or o.expiry_date > now())
  order by o.created_at desc
  limit limit_count;
  
  return coalesce(result, '[]'::jsonb);
end;
$$;

revoke all on function public.get_featured_offers(integer) from public;
grant execute on function public.get_featured_offers(integer) to anon, authenticated;
