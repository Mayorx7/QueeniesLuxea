-- 1. Create Enums
do $$ begin
  create type public.product_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.shipping_type as enum ('fixed', 'free', 'calculated');
exception
  when duplicate_object then null;
end $$;

-- 2. Create Products Table
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    vendor_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    description text,
    category text,
    subcategory text,
    price numeric(12,2) not null default 0,
    compare_at_price numeric(12,2),
    sale_enabled boolean default false,
    tags text[] default '{}',
    sizes jsonb default '[]',
    colors jsonb default '[]',
    weight numeric(8,2),
    shipping_type public.shipping_type default 'fixed',
    shipping_fee numeric(12,2),
    delivery_zones jsonb default '{}',
    sku text,
    barcode text,
    status public.product_status default 'draft',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. Create Product Images Table
create table if not exists public.product_images (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products(id) on delete cascade not null,
    url text not null,
    display_order integer default 0,
    created_at timestamptz not null default now()
);

-- 4. Create Product Variants Table
create table if not exists public.product_variants (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products(id) on delete cascade not null,
    label text not null,
    stock integer not null default 0,
    low_stock_threshold integer not null default 3,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 5. Enable Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

-- 6. RLS Policies

-- PRODUCTS
drop policy if exists "Public can view published products" on public.products;
create policy "Public can view published products" on public.products
  for select using (status = 'published');

drop policy if exists "Vendors can view their own products" on public.products;
create policy "Vendors can view their own products" on public.products
  for select using (auth.uid() = vendor_id);

drop policy if exists "Vendors can insert their own products" on public.products;
create policy "Vendors can insert their own products" on public.products
  for insert with check (auth.uid() = vendor_id);

drop policy if exists "Vendors can update their own products" on public.products;
create policy "Vendors can update their own products" on public.products
  for update using (auth.uid() = vendor_id);

drop policy if exists "Vendors can delete their own products" on public.products;
create policy "Vendors can delete their own products" on public.products
  for delete using (auth.uid() = vendor_id);

-- PRODUCT IMAGES
drop policy if exists "Public can view published product images" on public.product_images;
create policy "Public can view published product images" on public.product_images
  for select using (
    exists (
      select 1 from public.products
      where products.id = product_images.product_id and products.status = 'published'
    )
  );

drop policy if exists "Vendors can manage images for their products" on public.product_images;
create policy "Vendors can manage images for their products" on public.product_images
  for all using (
    exists (
      select 1 from public.products
      where products.id = product_images.product_id and products.vendor_id = auth.uid()
    )
  );

-- PRODUCT VARIANTS
drop policy if exists "Public can view published product variants" on public.product_variants;
create policy "Public can view published product variants" on public.product_variants
  for select using (
    exists (
      select 1 from public.products
      where products.id = product_variants.product_id and products.status = 'published'
    )
  );

drop policy if exists "Vendors can manage variants for their products" on public.product_variants;
create policy "Vendors can manage variants for their products" on public.product_variants
  for all using (
    exists (
      select 1 from public.products
      where products.id = product_variants.product_id and products.vendor_id = auth.uid()
    )
  );

-- Function and trigger to auto-update updated_at column
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_product_variants_updated_at on public.product_variants;
create trigger set_product_variants_updated_at
  before update on public.product_variants
  for each row execute procedure public.handle_updated_at();
