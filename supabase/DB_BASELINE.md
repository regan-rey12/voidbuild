# Supabase DB Baseline — 23 Aug 2026

This file records the known live production baseline before the trust-hardening migration work.

## Production project
- Project ref: `xrqvdbjoezyszlvhffwj`
- Environment reviewed: production

## Live public tables

### projects
Columns observed:
- id text not null
- business_name text not null
- category text not null
- template_json jsonb not null
- phone text null
- user_id text null
- subdomain text null
- custom_domain text null
- views integer null
- whatsapp_clicks integer null
- published boolean null
- created_at timestamptz null

Indexes observed:
- projects_pkey
- idx_projects_user_id
- idx_projects_created_at

### payments
Columns observed:
- id uuid not null
- user_id text null
- plan text not null
- transaction_id text not null
- phone text null
- amount integer null
- status text null
- created_at timestamptz null

Indexes observed:
- payments_pkey
- idx_payments_user_id

### events
Columns observed:
- id uuid not null
- project_id text null
- user_id text null
- event_type text null
- created_at timestamptz null

Indexes observed:
- events_pkey

### feedback
Columns observed:
- id uuid not null
- user_id text null
- rating text not null
- comment text null
- template_id text null
- business_name text null
- url text null
- user_agent text null
- created_at timestamptz null

Indexes observed:
- feedback_pkey
- idx_feedback_created_at

## Live policy posture observed
All four tables were reported with permissive public ALL policies:
- projects: `Allow all projects access`
- payments: `Allow all payments access`
- events: `Allow all events access`
- feedback: `Allow feedback all`

Those policies are treated as insecure and temporary. New forward migrations must replace them.

## Important implications
1. Production DB is ahead of the repo schema in some areas, especially `projects`.
2. The old `supabase/schema.sql` is stale and should not be treated as deployable truth.
3. Future DB work must migrate forward from production reality.
4. Payment truth and analytics truth should move into dedicated lifecycle tables and secure policies.
