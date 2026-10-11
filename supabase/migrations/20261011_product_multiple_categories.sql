-- Let a product appear in more than one catalogue category while retaining the
-- existing category column as its primary category for backwards compatibility.
alter table public.products
  add column if not exists categories text[];

-- Preserve every existing product's category when the migration is first run.
update public.products
set categories = array[category]
where (categories is null or cardinality(categories) = 0)
  and category is not null;

alter table public.products
  alter column categories set default '{}';

update public.products
set categories = '{}'
where categories is null;

alter table public.products
  alter column categories set not null;

create index if not exists products_categories_gin_idx
  on public.products using gin (categories);

-- Some phones save JPEG images with the .jfif extension. Keep the existing
-- product-image bucket compatible with those uploads as well.
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/jfif']
where id = 'product-images';
