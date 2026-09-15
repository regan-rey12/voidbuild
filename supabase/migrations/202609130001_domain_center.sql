-- VoidBuild Domain Center
-- Apply this migration in Supabase before enabling registrar/provider credentials.

alter table public.projects
  add column if not exists custom_domain_status text not null default 'none',
  add column if not exists custom_domain_verification jsonb not null default '[]'::jsonb,
  add column if not exists custom_domain_error text,
  add column if not exists custom_domain_connected_at timestamptz,
  add column if not exists custom_domain_verified_at timestamptz,
  add column if not exists custom_domain_removed_at timestamptz;

update public.projects
set custom_domain_status = case when custom_domain is null then 'none' else 'pending_dns' end
where custom_domain_status is null or (custom_domain_status = 'none' and custom_domain is not null);

alter table public.projects
  drop constraint if exists projects_custom_domain_status_check;

alter table public.projects
  add constraint projects_custom_domain_status_check
  check (custom_domain_status in ('none', 'pending_dns', 'verifying', 'active', 'error', 'removed', 'provider_unconfigured'));

create unique index if not exists projects_custom_domain_unique_idx
  on public.projects (lower(custom_domain))
  where custom_domain is not null;

create table if not exists public.domain_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Kept as text for compatibility with existing project identifiers.
  project_id text,
  parent_order_id uuid references public.domain_orders(id) on delete set null,
  domain text not null,
  tld text not null check (tld in ('.ug', '.co.ug', '.com')),
  action text not null default 'registration' check (action in ('registration', 'renewal', 'transfer')),
  status text not null default 'payment_pending' check (status in ('payment_pending', 'paid', 'registering', 'registered', 'pending_dns', 'active', 'renewal_due', 'registration_failed', 'renewal_failed', 'transfer_pending', 'cancelled')),
  currency text not null default 'UGX',
  amount numeric(12, 2) not null,
  first_year_price numeric(12, 2),
  renewal_price numeric(12, 2),
  years integer not null default 1 check (years between 1 and 10),
  merchant_reference text not null unique,
  order_tracking_id text,
  provider text not null default 'pesapal',
  payment_payload jsonb not null default '{}'::jsonb,
  registrar text,
  registrar_order_id text,
  registrar_payload jsonb not null default '{}'::jsonb,
  registrant_details jsonb not null default '{}'::jsonb,
  ownership_details jsonb not null default '{}'::jsonb,
  transfer_code text,
  registration_date timestamptz,
  expiry_date timestamptz,
  hosting_status text,
  hosting_verification jsonb not null default '[]'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists domain_orders_user_created_idx on public.domain_orders (user_id, created_at desc);
create index if not exists domain_orders_project_idx on public.domain_orders (project_id, created_at desc);
create index if not exists domain_orders_domain_idx on public.domain_orders (lower(domain));

alter table public.domain_orders enable row level security;

drop policy if exists domain_orders_owner_select on public.domain_orders;
create policy domain_orders_owner_select on public.domain_orders
  for select using (auth.uid() = user_id);

-- Mutations are performed by server-side service-role routes after bearer auth.
drop policy if exists domain_orders_owner_insert on public.domain_orders;
create policy domain_orders_owner_insert on public.domain_orders
  for insert with check (auth.uid() = user_id);

drop policy if exists domain_orders_owner_update on public.domain_orders;
create policy domain_orders_owner_update on public.domain_orders
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.set_domain_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists domain_orders_updated_at on public.domain_orders;
create trigger domain_orders_updated_at
before update on public.domain_orders
for each row execute function public.set_domain_orders_updated_at();
