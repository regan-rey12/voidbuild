import Link from 'next/link';
import TopNav from '@/components/TopNav';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopNav currentPage="home" />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Privacy Policy - VoidBuild</h1>
        <p className="text-xs text-gray-500 mt-2">Last updated: August 26, 2026 • Complies with Uganda Data Protection and Privacy Act Cap 97</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="font-bold text-base">1. What Data We Collect</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Business Information:</strong> Business name, phone, WhatsApp, location, hours, and content you enter to create a website.</li>
              <li><strong>Website Content:</strong> Template JSON, text edits, links, and media references used in your website.</li>
              <li><strong>Account:</strong> Email, phone, and user ID from Supabase Auth when you sign in.</li>
              <li><strong>Usage:</strong> Page views, WhatsApp click events, feedback, and inquiry leads submitted through websites built on VoidBuild.</li>
              <li><strong>Payments:</strong> Plan, payment order references, transaction IDs, amount, and phone or email used during checkout. We do not store MoMo PINs or full card details.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">2. How We Use Data</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Create, save, and host websites on VoidBuild subdomains and share links.</li>
              <li>Show your project list, subscription state, analytics, and inquiry leads in the dashboard.</li>
              <li>Process secure payment verification and subscription activation via Pesapal.</li>
              <li>Improve templates and product quality using operational feedback.</li>
              <li>Support assisted setup requests, including custom-domain rollout where applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">3. Where Data is Stored</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Supabase:</strong> Projects, payments, subscriptions, payment orders, events, leads, and feedback are stored in Supabase-managed infrastructure.</li>
              <li><strong>Browser localStorage:</strong> Used only as a lightweight draft or fallback cache on your device. It is not the primary source of truth for subscriptions or public analytics.</li>
              <li><strong>Vercel:</strong> Hosts the VoidBuild application and secure server routes.</li>
              <li><strong>Pesapal:</strong> Processes checkout and payment verification.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">4. Data Protection - Uganda Data Protection Act Cap 97</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>We do not sell your data to third parties.</li>
              <li>Public websites you publish are intentionally visible to the public, including the content you choose to display.</li>
              <li>Operational payment, subscription, analytics, and lead records are processed through server-side routes and protected database access controls.</li>
              <li>If you need account-wide deletion assistance, contact hello@voidbuild.com or WhatsApp +256 751 391318.</li>
              <li>We may retain payment and accounting records for legal, tax, fraud-prevention, and reconciliation purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">5. Cookies &amp; Analytics</h2>
            <p className="mt-2">VoidBuild uses minimal session storage for authentication and device-level draft convenience. We do not run third-party advertising trackers. Website analytics inside VoidBuild are first-party events such as page views and WhatsApp clicks.</p>
          </section>

          <section>
            <h2 className="font-bold text-base">6. Your Rights</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Access: You can view your saved websites and supported dashboard data after signing in.</li>
              <li>Edit: You can update site content in the builder and save new changes.</li>
              <li>Delete: You can delete individual projects in the dashboard. For broader account deletion requests, contact support.</li>
              <li>Export: Share links and on-platform content access may help with export needs; for account-level export support, contact us directly.</li>
              <li>Complaint: If you believe your data rights were violated, contact us first at hello@voidbuild.com.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">7. Contact</h2>
            <p className="mt-2">For privacy questions, deletion requests, or complaints: Email hello@voidbuild.com or WhatsApp +256 751 391318.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="VoidBuild" className="w-5 h-5 object-contain flex-shrink-0" />
            <span>© 2026 voidbuild — Built for Uganda</span>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/pricing" className="hover:underline">Pricing</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
