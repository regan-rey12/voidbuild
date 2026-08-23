-- VoidBuild trust foundation migration
-- Built from live production DB baseline on 2026-08-23
-- IMPORTANT: this migration replaces broad public ALL access patterns
-- and introduces server-trusted tables for subscriptions, payment orders, and leads.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1) Bring existing production tables to the target baseline
-- ---------------------------------------------------------------------------

alter table public.projects
  add column if not exists updated_at timestamp with time zone default now();

alter table public.payments
  add column if not exists provider text default 'pesapal',
  add column if not exists merchant_reference text,
  add column if not exists order_tracking_id text,
  add column if not exists raw_response jsonb,
  add column if not exists updated_at timestamp with time zone default now();

alter table public.events
  add column if not exists referrer text,
  add column if not exists user_agent text,
  add column if not exists metadata jsonb,
  add column if not exists visitor_hash text;

alter table public.feedback
  add column if not exists metadata jsonb;

-- Keep current product behavior where saved sites are effectively treated as live.
update public.projects
set views = coalesce(views, 0),
    whatsapp_clicks = coalesce(whatsapp_clicks, 0),
    published = true,
    updated_at = coalesce(updated_at, created_at, now())
where true;

update public.payments
set provider = coalesce(provider, 'pesapal'),
    updated_at = coalesce(updated_at, created_at, now())
where true;

-- ---------------------------------------------------------------------------
-- 2) Add new trusted lifecycle tables
-- ---------------------------------------------------------------------------

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  plan text not null,
  status text not null default 'active',
  started_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  source_payment_id uuid references public.payments(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint subscriptions_plan_check check (plan in ('free', 'hustler', 'business', 'pro')),
  constraint subscriptions_status_check check (status in ('active', 'past_due', 'cancelled', 'expired', 'trialing'))
);

create unique index if not exists idx_subscriptions_user_id_unique
  on public.subscriptions(user_id);
create index if not exists idx_subscriptions_plan
  on public.subscriptions(plan);
create index if not exists idx_subscriptions_status
  on public.subscriptions(status);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  plan text not null,
  amount integer not null,
  merchant_reference text not null,
  order_tracking_id text,
  status text not null default 'pending',
  phone text,
  email text,
  provider text not null default 'pesapal',
  callback_payload jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint payment_orders_plan_check check (plan in ('hustler', 'business', 'pro')),
  constraint payment_orders_status_check check (status in ('pending', 'redirected', 'paid', 'failed', 'cancelled', 'expired'))
);

create unique index if not exists idx_payment_orders_merchant_reference_unique
  on public.payment_orders(merchant_reference);
create unique index if not exists idx_payment_orders_tracking_id_unique
  on public.payment_orders(order_tracking_id)
  where order_tracking_id is not null;
create index if not exists idx_payment_orders_user_id
  on public.payment_orders(user_id);
create index if not exists idx_payment_orders_status
  on public.payment_orders(status);
create index if not exists idx_payment_orders_created_at
  on public.payment_orders(created_at desc);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  name text not null,
  phone text,
  message text not null,
  source text not null default 'website',
  status text not null default 'new',
  created_at timestamp with time zone default now(),
  constraint leads_status_check check (status in ('new', 'contacted', 'closed', 'spam'))
);

create index if not exists idx_leads_project_id
  on public.leads(project_id);
create index if not exists idx_leads_created_at
  on public.leads(created_at desc);
create index if not exists idx_leads_status
  on public.leads(status);

-- ---------------------------------------------------------------------------
-- 3) Add missing indexes and uniqueness on existing public tables
-- ---------------------------------------------------------------------------

create unique index if not exists idx_projects_subdomain_unique
  on public.projects(lower(subdomain))
  where subdomain is not null and btrim(subdomain) <> '';

create unique index if not exists idx_projects_custom_domain_unique
  on public.projects(lower(custom_domain))
  where custom_domain is not null and btrim(custom_domain) <> '';

create index if not exists idx_projects_published
  on public.projects(published);

create index if not exists idx_projects_subdomain
  on public.projects(subdomain)
  where subdomain is not null;

create index if not exists idx_projects_custom_domain
  on public.projects(custom_domain)
  where custom_domain is not null;

create index if not exists idx_events_project_created_at
  on public.events(project_id, created_at desc);

create index if not exists idx_events_type_created_at
  on public.events(event_type, created_at desc);

create index if not exists idx_payments_created_at
  on public.payments(created_at desc);

create index if not exists idx_payments_status
  on public.payments(status);

create index if not exists idx_payments_order_tracking_id
  on public.payments(order_tracking_id)
  where order_tracking_id is not null;

-- ---------------------------------------------------------------------------
-- 4) Enable row level security on all tables
-- ---------------------------------------------------------------------------

alter table public.projects enable row level security;
alter table public.payments enable row level security;
alter table public.events enable row level security;
alter table public.feedback enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_orders enable row level security;
alter table public.leads enable row level security;

-- ---------------------------------------------------------------------------
-- 5) Remove insecure legacy policies
-- ---------------------------------------------------------------------------

drop policy if exists "Allow all projects access" on public.projects;
drop policy if exists "Allow insert own" on public.projects;
drop policy if exists "Allow public read single project" on public.projects;
drop policy if exists "Allow update own" on public.projects;
drop policy if exists "Allow delete own" on public.projects;

drop policy if exists "Allow all payments access" on public.payments;
drop policy if exists "Allow payments all" on public.payments;

drop policy if exists "Allow all events access" on public.events;
drop policy if exists "Allow events all" on public.events;

drop policy if exists "Allow feedback all" on public.feedback;

drop policy if exists "Subscriptions owner read" on public.subscriptions;
drop policy if exists "Subscriptions service manage" on public.subscriptions;

drop policy if exists "Payment orders owner read" on public.payment_orders;
drop policy if exists "Payment orders service manage" on public.payment_orders;

drop policy if exists "Leads owner read" on public.leads;
drop policy if exists "Leads service manage" on public.leads;

-- ---------------------------------------------------------------------------
-- 6) Create safe production policies
-- ---------------------------------------------------------------------------

-- Projects: published public reads + owner CRUD
create policy "Projects public read published"
  on public.projects
  for select
  to anon, authenticated
  using (published = true);

create policy "Projects owner read own"
  on public.projects
  for select
  to authenticated
  using (auth.uid()::text = user_id);

create policy "Projects owner insert own"
  on public.projects
  for insert
  to authenticated
  with check (auth.uid()::text = user_id);

create policy "Projects owner update own"
  on public.projects
  for update
  to authenticated
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "Projects owner delete own"
  on public.projects
  for delete
  to authenticated
  using (auth.uid()::text = user_id);

-- Payments: owner read only; trusted server writes via service role
create policy "Payments owner read own"
  on public.payments
  for select
  to authenticated
  using (auth.uid()::text = user_id);

-- Payment orders: owner read only; trusted server writes via service role
create policy "Payment orders owner read own"
  on public.payment_orders
  for select
  to authenticated
  using (auth.uid()::text = user_id);

-- Subscriptions: owner read only; trusted server writes via service role
create policy "Subscriptions owner read own"
  on public.subscriptions
  for select
  to authenticated
  using (auth.uid()::text = user_id);

-- Events: project owners can read analytics for their own projects only
create policy "Events owner read own project events"
  on public.events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = events.project_id
        and p.user_id = auth.uid()::text
    )
  );

-- Feedback: public insert only; reading handled by trusted server/admin
create policy "Feedback public insert"
  on public.feedback
  for insert
  to anon, authenticated
  with check (true);

-- Leads: reading only for project owners; writes handled by trusted server route
create policy "Leads owner read own project leads"
  on public.leads
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = leads.project_id
        and p.user_id = auth.uid()::text
    )
  );

-- ---------------------------------------------------------------------------
-- 7) Seed subscriptions from existing confirmed payments where missing
-- ---------------------------------------------------------------------------

insert into public.subscriptions (user_id, plan, status, started_at, created_at, updated_at)
select distinct on (p.user_id)
  p.user_id,
  p.plan,
  case when coalesce(p.status, 'completed') = 'completed' then 'active' else 'past_due' end,
  coalesce(p.created_at, now()),
  coalesce(p.created_at, now()),
  now()
from public.payments p
where p.user_id is not null
  and p.plan in ('free', 'hustler', 'business', 'pro')
  and not exists (
    select 1
    from public.subscriptions s
    where s.user_id = p.user_id
  )
order by p.user_id, p.created_at desc nulls last;
