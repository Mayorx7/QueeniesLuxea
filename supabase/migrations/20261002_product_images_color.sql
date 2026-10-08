-- Add optional color_name column to product_images so images can be
-- associated with a specific product color variant. NULL means the image
-- applies to all colors (shared / fallback).
alter table public.product_images
  add column if not exists color_name text default null;
