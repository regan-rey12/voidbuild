# Domain Center launch checklist

The Domain Center separates three concerns:

- **Hosting:** `lib/domain-provider.ts` talks to Vercel using server-only credentials.
- **Registration:** `lib/domain-registrar.ts` uses Vercel's Domains Registrar API for the initial `.com` launch. The Uganda Registry adapter remains isolated for a later `.ug` and `.co.ug` phase.
- **Billing:** `domain_orders` and the domain-order Pesapal callback are separate from annual subscription tables and callbacks.

## Before enabling it

1. Apply `supabase/migrations/202609130001_domain_center.sql`. If that migration was already applied before the Vercel registrar update, also apply `supabase/migrations/202609130002_vercel_registrar_order_id.sql`.
2. Add these server-only Vercel variables:
   - `VERCEL_TOKEN`
   - `VERCEL_PROJECT_ID`
   - `VERCEL_TEAM_ID` when the token belongs to a Vercel team
3. Confirm that the Vercel account/team has access to the Domains Registrar API and that `.com` is supported for the account.
4. Confirm the existing Pesapal server credentials and IPN configuration. Domain payments use the same Pesapal account but create separate `domain_orders`; they do not create or renew subscriptions.
5. Do not configure Uganda Registry yet unless `.ug` and `.co.ug` registration are added in a later phase. The initial new-domain search and purchase flow is `.com` only.

## User flows

- **Connect existing:** `POST /api/domains`, `GET /api/domains/:projectId`, `POST /api/domains/:projectId/verify`, and `DELETE /api/domains/:projectId`.
- **Search:** `GET /api/domains/search?query=name` — currently returns `name.com` candidates.
- **Register:** `POST /api/domain-orders`, followed by the separate domain-order callback.
- **Track:** `GET /api/domain-orders/:id` or `GET /api/domain-orders?projectId=...`.
- **Renew:** `POST /api/domain-orders/:id/renew`.

The public host proxy only rewrites custom hosts to the custom-site route. Main VoidBuild hosts, VoidBuild subdomains, API requests, Next assets, public assets, robots, and sitemap requests bypass custom-page rewriting. Custom hosts are rendered only when their saved project is published and the custom-domain status is active.

## Disposable-domain test sequence

1. Use a disposable `.com` domain and confirm the Vercel account's live purchase price before approving a purchase.
2. Search it in Domain Center and confirm availability plus the purchase and renewal prices returned by Vercel.
3. Create a domain order with the configured Pesapal credentials and complete the separate payment.
4. Confirm the order records the Vercel registrar order ID, registrant/ownership data, registration state, and transfer code when Vercel makes it available.
5. Confirm successful registration automatically saves the domain on the selected project and returns the exact Vercel DNS challenge.
6. Add the challenge at the domain's DNS provider, retry verification, and confirm `custom_domain_status=active`.
7. Request a renewal and confirm a new `domain_orders` row is created without changing `subscriptions`.
8. Disconnect the domain and confirm the VoidBuild subdomain remains available.

Never commit any provider, registrar, or payment secret to the repository or include it in diagnostics or archives.
