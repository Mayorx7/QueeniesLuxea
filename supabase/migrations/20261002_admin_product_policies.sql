-- Allow admins to select, update, and delete ANY product (regardless of vendor_id).
-- This fixes the bug where admin deletes were silently blocked by RLS because
-- the existing "Vendors can delete their own products" policy only passes when
-- auth.uid() = vendor_id — which is never true for an admin user.

drop policy if exists "Admins can view all products"   on public.products;
drop policy if exists "Admins can update all products" on public.products;
drop policy if exists "Admins can delete all products" on public.products;

create policy "Admins can view all products"
  on public.products for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update all products"
  on public.products for update
  to authenticated
  using (public.is_admin());

create policy "Admins can delete all products"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- Also let admins manage product_images and product_variants for any product
drop policy if exists "Admins can manage all product images"   on public.product_images;
drop policy if exists "Admins can manage all product variants" on public.product_variants;

create policy "Admins can manage all product images"
  on public.product_images for all
  to authenticated
  using (public.is_admin());

create policy "Admins can manage all product variants"
  on public.product_variants for all
  to authenticated
  using (public.is_admin());
