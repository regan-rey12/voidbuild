import Link from 'next/link';
import TopNav from '@/components/TopNav';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopNav currentPage="home" />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Privacy Policy - VoidBuild</h1>
        <p className="text-xs text-gray-500 mt-2">Last updated: July 24, 2026 • Complies with Uganda Data Protection and Privacy Act Cap 97</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="font-bold text-base">1. What Data We Collect</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Business Information:</strong> Business name, phone, WhatsApp, location, hours you enter to generate website</li>
              <li><strong>Website Content:</strong> Template JSON, images you upload, text you edit</li>
              <li><strong>Account:</strong> Email, phone, user ID from Supabase Auth if you sign in</li>
              <li><strong>Usage:</strong> Views, WhatsApp clicks, feedback rating/comment</li>
              <li><strong>Payments:</strong> Plan type, transaction ID, phone used to pay (we do NOT store MoMo PIN, card numbers - handled by Pesapal)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">2. How We Use Data</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Generate and host your website at voidbuild.com/p/id and {`{name}`}.voidbuild.com</li>
              <li>Save your projects to dashboard, sync across devices if you sign in</li>
              <li>Improve AI templates based on anonymous feedback (we read every feedback)</li>
              <li>Process payments via Pesapal (MTN MoMo, Airtel Money, Cards) - 3.5% fee, auto verified</li>
              <li>Show analytics: views, WhatsApp clicks in dashboard</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">3. Where Data is Stored</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Supabase (EU/US):</strong> Projects, payments, feedback, events tables - encrypted at rest, RLS row level security with user_id isolation</li>
              <li><strong>Browser localStorage:</strong> Temporary fallback if Supabase not configured - your sites saved locally on device, you can clear anytime via browser settings</li>
              <li><strong>Cloudflare Pages / Vercel:</strong> Hosting for voidbuild.com builder, edge in Africa (Nairobi, Lagos) for fast 2G loads</li>
              <li><strong>Images:</strong> Supabase Storage bucket images (public) or data URL in site JSON if offline</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">4. Data Protection - Uganda Data Protection Act Cap 97</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>You own your business data - you can export, edit, delete anytime in dashboard</li>
              <li>We do NOT sell your data to third parties</li>
              <li>We do NOT store MoMo PIN, card numbers - payments handled by Pesapal (PCI compliant)</li>
              <li>Images you upload: public read (since website is public), but only you can upload/update/delete your own via user_id</li>
              <li>Right to be forgotten: Email hello@voidbuild.com or delete account in dashboard (coming) to delete all your projects, feedback, payments data</li>
              <li>Data retention: Projects kept until you delete, feedback kept 1 year for improving AI, payments kept 7 years for URA tax compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">5. Cookies & Analytics</h2>
            <p className="mt-2">We use minimal cookies: Supabase auth session cookie to keep you signed in, localStorage for projects. No tracking cookies, no ads. Analytics is first-party only (views, WhatsApp clicks) stored in Supabase events table, not shared.</p>
          </section>

          <section>
            <h2 className="font-bold text-base">6. Your Rights</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Access: View your data in dashboard</li>
              <li>Edit: Click text/image to edit in builder, changes save instantly</li>
              <li>Delete: Delete project in dashboard, or email hello@voidbuild.com to delete account and all data</li>
              <li>Export: Copy share link /p/id?d=base64 contains full site JSON, or contact support for full export</li>
              <li>Complaint: If you believe your data rights violated, contact NITA-U or Uganda Data Protection Office</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">7. Contact</h2>
            <p className="mt-2">For privacy questions, data deletion, or complaints: Email hello@voidbuild.com or WhatsApp +256 751 391318. We respond within 24 hours.</p>
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
