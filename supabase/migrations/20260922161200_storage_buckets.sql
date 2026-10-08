-- Migration: Storage Buckets
-- Creates a public bucket for product images and sets up RLS policies.

-- Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- Note: RLS on storage.objects is already enabled by Supabase by default.
-- Do NOT run ALTER TABLE on storage.objects — it's owned by supabase_storage_admin.

-- 1. Allow public read access to the product-images bucket
create policy "Public can view product images"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- 2. Allow authenticated users (vendors) to insert images
create policy "Vendors can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images' and
    auth.role() = 'authenticated'
  );

-- 3. Allow users to update their own images
create policy "Users can update their own images"
  on storage.objects for update
  using (
    bucket_id = 'product-images' and
    auth.uid() = owner
  )
  with check (
    bucket_id = 'product-images' and
    auth.uid() = owner
  );

-- 4. Allow users to delete their own images
create policy "Users can delete their own images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images' and
    auth.uid() = owner
  );
