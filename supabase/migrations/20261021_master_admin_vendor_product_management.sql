-- Promote the requested account and give administrators full catalogue-management
-- access. An administrator can use both the admin and vendor product screens,
-- while ordinary vendors remain limited to products they own.

insert into public.profiles (id, email, role)
select id, email, 'admin'::public.user_role
from auth.users
where lower(email) = 'giftadegahi@gmail.com'
on conflict (id) do update
set email = excluded.email,
    role = 'admin'::public.user_role,
    updated_at = now();

-- Keep the policies explicit and ensure updates may retain the original vendor.
drop policy if exists "Admins can view all products" on public.products;
drop policy if exists "Admins can update all products" on public.products;
drop policy if exists "Admins can delete all products" on public.products;

create policy "Admins can view all products"
  on public.products for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can create products" on public.products;
create policy "Admins can create products"
  on public.products for insert to authenticated
  with check (public.is_admin());

create policy "Admins can update all products"
  on public.products for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete all products"
  on public.products for delete to authenticated
  using (public.is_admin());

drop policy if exists "Admins can manage all product images" on public.product_images;
drop policy if exists "Admins can manage all product variants" on public.product_variants;

create policy "Admins can manage all product images"
  on public.product_images for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage all product variants"
  on public.product_variants for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
