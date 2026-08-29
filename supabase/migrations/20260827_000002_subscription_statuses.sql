-- Allow richer subscription states for renewal, grace-period, and expiry handling.

alter table public.subscriptions
  drop constraint if exists subscriptions_status_check;

alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('active', 'grace_period', 'past_due', 'cancelled', 'expired', 'trialing'));
