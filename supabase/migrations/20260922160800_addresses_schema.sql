-- Migration: Addresses Schema
-- Creates a table for customers to store multiple addresses, with flags for default shipping/billing.

create table public.addresses (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  
  first_name text not null,
  last_name text not null,
  address text not null,
  city text not null,
  state text,
  postcode text,
  country text not null default 'Nigeria',
  phone text,
  
  is_default_shipping boolean not null default false,
  is_default_billing boolean not null default false,
  
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Indexes
create index addresses_user_id_idx on public.addresses(user_id);

-- RLS
alter table public.addresses enable row level security;

-- Customers can view their own addresses
create policy "Customers can view own addresses" 
  on public.addresses for select 
  using (auth.uid() = user_id);

-- Customers can insert their own addresses
create policy "Customers can insert own addresses" 
  on public.addresses for insert 
  with check (auth.uid() = user_id);

-- Customers can update their own addresses
create policy "Customers can update own addresses" 
  on public.addresses for update 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Customers can delete their own addresses
create policy "Customers can delete own addresses" 
  on public.addresses for delete 
  using (auth.uid() = user_id);

-- Function and trigger to auto-update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger set_addresses_updated_at
  before update on public.addresses
  for each row
  execute function public.handle_updated_at();

-- RPC to set an address as default, which ensures other addresses for the user are unset
create or replace function public.set_default_address(
  address_id_input uuid,
  is_shipping_input boolean,
  is_billing_input boolean
) returns void as $$
declare
  v_user_id uuid;
begin
  -- Ensure caller is authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Ensure the address belongs to the user
  select user_id into v_user_id from public.addresses where id = address_id_input;
  if v_user_id is null or v_user_id != auth.uid() then
    raise exception 'Address not found or does not belong to you';
  end if;

  -- If setting as default shipping, unset others
  if is_shipping_input then
    update public.addresses
    set is_default_shipping = false
    where user_id = auth.uid() and id != address_id_input;
  end if;

  -- If setting as default billing, unset others
  if is_billing_input then
    update public.addresses
    set is_default_billing = false
    where user_id = auth.uid() and id != address_id_input;
  end if;

  -- Finally, set the requested address
  update public.addresses
  set 
    is_default_shipping = case when is_shipping_input then true else is_default_shipping end,
    is_default_billing = case when is_billing_input then true else is_default_billing end
  where id = address_id_input;

end;
$$ language plpgsql security definer;
