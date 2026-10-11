-- Migration: Offer Images Storage Bucket
-- Date: 2026-10-10
-- Creates a public bucket for offer images and sets up RLS policies.

-- Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'offer-images',
  'offer-images',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- Note: RLS on storage.objects is already enabled by Supabase by default.
-- Do NOT run ALTER TABLE on storage.objects — it's owned by supabase_storage_admin.

-- 1. Allow public read access to the offer-images bucket
create policy "Public can view offer images"
  on storage.objects for select
  using ( bucket_id = 'offer-images' );

-- 2. Allow authenticated users (vendors) to insert offer images
create policy "Vendors can upload offer images"
  on storage.objects for insert
  with check (
    bucket_id = 'offer-images' and
    auth.role() = 'authenticated'
  );

-- 3. Allow users to update their own offer images
create policy "Users can update their own offer images"
  on storage.objects for update
  using (
    bucket_id = 'offer-images' and
    auth.uid() = owner
  )
  with check (
    bucket_id = 'offer-images' and
    auth.uid() = owner
  );

-- 4. Allow users to delete their own offer images
create policy "Users can delete their own offer images"
  on storage.objects for delete
  using (
    bucket_id = 'offer-images' and
    auth.uid() = owner
  );
