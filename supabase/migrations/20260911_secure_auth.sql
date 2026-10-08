-- Run this in the Supabase SQL editor or with the Supabase CLI before enabling the UI.
-- Privileged role changes must be performed by a trusted server using the service-role key.
do $$ begin
  create type public.user_role as enum ('customer', 'vendor', 'admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Supports databases where a previous partial run created the table/type.
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists role public.user_role not null default 'customer';
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Populate the email column for profiles created before email was stored here.
update public.profiles as profile
set email = auth_user.email
from auth.users as auth_user
where profile.id = auth_user.id and profile.email is null;

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Role is intentionally omitted: every self-registered account starts as a customer.
  insert into public.profiles (id, email, first_name, last_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

drop policy if exists "users read their own profile" on public.profiles;
drop policy if exists "admins read profiles" on public.profiles;
create policy "users read their own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "admins read profiles" on public.profiles for select to authenticated using (public.is_admin());

-- Users deliberately receive no direct UPDATE policy: otherwise they could submit role = 'admin'.
-- Use this narrow RPC for permitted profile fields only.
create or replace function public.update_my_profile(first_name_input text, last_name_input text)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare updated_profile public.profiles;
begin
  update public.profiles set
    first_name = nullif(trim(first_name_input), ''),
    last_name = nullif(trim(last_name_input), ''),
    updated_at = now()
  where id = auth.uid()
  returning * into updated_profile;
  return updated_profile;
end;
$$;
revoke all on function public.update_my_profile(text, text) from public;
grant execute on function public.update_my_profile(text, text) to authenticated;

-- Only an authenticated administrator may change a user's role. This function
-- is the sole browser-accessible role mutation path; do not expose a direct
-- UPDATE policy on profiles.
create or replace function public.update_user_role(user_id_input uuid, role_input public.user_role)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare updated_profile public.profiles;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can change user roles';
  end if;

  update public.profiles set role = role_input, updated_at = now()
  where id = user_id_input
  returning * into updated_profile;

  if updated_profile is null then
    raise exception 'User profile was not found';
  end if;
  return updated_profile;
end;
$$;
revoke all on function public.update_user_role(uuid, public.user_role) from public;
grant execute on function public.update_user_role(uuid, public.user_role) to authenticated;
