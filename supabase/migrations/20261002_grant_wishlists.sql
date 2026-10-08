-- Grant table-level privileges on wishlists to authenticated users.
-- RLS policies alone aren't enough; Postgres requires both a passing RLS policy
-- AND the role to have column/table-level privileges.
-- Without this GRANT, authenticated requests receive a 403 even when the
-- RLS "Customers can view own wishlists" policy would otherwise allow them.

grant select, insert, delete on public.wishlists to authenticated;
