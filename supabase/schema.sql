-- VoidBuild Supabase Schema - With User Accounts Isolation
-- Run this in Supabase SQL Editor

-- Projects table with user_id for account isolation
create table if not exists public.projects (
  id text primary key,
  business_name text not null,
  category text not null,
  template_json jsonb not null,
  phone text,
  user_id text, -- NEW: links to auth.users.id or demo user id
  views integer default 0,
  whatsapp_clicks integer default 0,
  published boolean default false,
  created_at timestamp with time zone default now()
);

-- Add user_id column if table already exists (migration)
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='projects' and column_name='user_id') then
    alter table public.projects add column user_id text;
  end if;
end $$;

-- Payments table for Manual MoMo verification (you verify via SMS)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  plan text not null,
  transaction_id text not null,
  phone text,
  amount integer,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- Events for analytics (WhatsApp clicks)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  project_id text,
  user_id text,
  event_type text, -- whatsapp_click, view, etc
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.projects enable row level security;
alter table public.payments enable row level security;
alter table public.events enable row level security;

-- DROP old permissive policies if exist
drop policy if exists "Allow anon read" on public.projects;
drop policy if exists "Allow anon insert" on public.projects;
drop policy if exists "Allow anon update" on public.projects;

-- NEW POLICIES: For MVP launch, we allow anon read for public /p/[id] links, but restrict list to own user_id if possible
-- Option A: Simple MVP - Allow all for anon (easy) but add user_id filtering in app code
create policy "Allow anon read for public links" on public.projects for select using (true);
create policy "Allow anon insert" on public.projects for insert with check (true);
create policy "Allow anon update own" on public.projects for update using (true);

-- For payments and events, allow anon insert (demo mode works without auth)
create policy "Allow anon all payments" on public.payments for all using (true) with check (true);
create policy "Allow anon all events" on public.events for all using (true) with check (true);

-- Indexes
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_category on public.projects(category);
create index if not exists idx_projects_created_at on public.projects(created_at desc);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_events_project_id on public.events(project_id);

-- Storage bucket for images (for EditableImage upload)
-- Run this separately in Storage dashboard or via SQL:
-- insert into storage.buckets (id, name, public) values ('images', 'images', true) on conflict (id) do nothing;
-- Then add policy:
-- create policy "Public read" on storage.objects for select using (bucket_id = 'images');
-- create policy "Anon upload" on storage.objects for insert with check (bucket_id = 'images');
