-- Vercel Domains Registrar API order tracking.
-- Apply this after 202609130001_domain_center.sql if that migration was already applied.

alter table public.domain_orders
  add column if not exists registrar_order_id text;

create index if not exists domain_orders_registrar_order_idx
  on public.domain_orders (registrar_order_id)
  where registrar_order_id is not null;
