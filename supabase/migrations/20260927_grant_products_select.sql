-- Grant table-level SELECT to anon and authenticated roles.
-- RLS policies alone are not sufficient - Postgres requires both a passing RLS
-- policy AND the role to have column/table-level privileges.
-- Without these GRANTs, unauthenticated requests receive a 401 even when the
-- RLS "Public can view published products" policy would otherwise allow them.

grant select on public.products         to anon, authenticated;
grant select on public.product_images   to anon, authenticated;
grant select on public.product_variants to anon, authenticated;

-- Vendor write permissions (already blocked by RLS, but explicit is safer)
grant insert, update, delete on public.products         to authenticated;
grant insert, update, delete on public.product_images   to authenticated;
grant insert, update, delete on public.product_variants to authenticated;
