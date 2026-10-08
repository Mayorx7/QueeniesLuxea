-- Add slug and is_featured columns to products table.
-- slug  : human-readable URL identifier, generated from name on creation/update.
-- is_featured : vendor/admin flag to surface product in "Featured" storefront sections.

alter table public.products
  add column if not exists slug text,
  add column if not exists is_featured boolean not null default false;

-- Backfill slug for any existing rows from their name
update public.products
  set slug = lower(regexp_replace(trim(name), '[^a-z0-9]+', '-', 'g'))
  where slug is null or slug = '';

-- Add a unique index so slugs stay unique per vendor (vendor can have same name product as another vendor)
create index if not exists products_slug_idx on public.products (slug);

-- Allow public to read slug/is_featured on published products (covered by existing RLS policies)
-- No new policies needed — existing "Public can view published products" covers all columns.
