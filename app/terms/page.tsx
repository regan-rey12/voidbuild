import Link from 'next/link';
import TopNav from '../../components/TopNav';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopNav currentPage="home" />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Terms of Service - VoidBuild</h1>
        <p className="text-xs text-gray-500 mt-2">Last updated: July 24, 2026 • voidbuild.com</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="font-bold text-base">1. What VoidBuild Does</h2>
            <p className="mt-2">VoidBuild is AI website builder for Ugandan SMEs. You describe business, AI generates website with UGX pricing, WhatsApp button, map. You edit text/images, save, get public link /p/id or {`{name}`}.voidbuild.com subdomain, or custom domain on Business/Pro plans. Hosting included.</p>
          </section>

          <section>
            <h2 className="font-bold text-base">2. Plans & Pricing (UGX)</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Free:</strong> 1 website, voidbuild.com/p/id link, VoidBuild badge, 100 views/mo. Free forever, no card needed.</li>
              <li><strong>Starter UGX 15,000/mo:</strong> 1 site, no badge, {`{name}`}.voidbuild.com, 5k views, WhatsApp button</li>
              <li><strong>Business UGX 35,000/mo (Popular):</strong> 3 sites, custom domain, 20k views, analytics, priority WhatsApp support</li>
              <li><strong>Pro UGX 75,000/mo:</strong> 10 sites, unlimited views, online store (WhatsApp orders)</li>
              <li>Prices in UGX, pay via Pesapal with MTN MoMo, Airtel Money, Card. 3.5% fee included. No hidden fees, same price forever, no renewal trap like Hostinger.</li>
              <li>Cancel anytime in dashboard or email support@voidbuild.com - no questions</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">3. Your Responsibilities</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>You own your business content - ensure you have rights to images/text you upload</li>
              <li>No illegal content, no hate speech, no scam. We reserve right to remove sites violating Ugandan law or our policy</li>
              <li>Keep login secure - don't share password, magic link expires in 1 hour</li>
              <li>For custom domains, you must own domain and add CNAME to voidbuild.com as instructed</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">4. Our Responsibilities</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Host your site at /p/id and subdomain with 99% uptime (Cloudflare Pages/Vercel free tier, best effort)</li>
              <li>Keep builder working, AI generation with fallback to closest template if AI fails (never show Failed)</li>
              <li>Secure your data with Supabase RLS user_id isolation, HTTPS, no storing MoMo PINs/cards</li>
              <li>Support via WhatsApp +256 774 919318, respond within 24 hrs</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">5. Payments & Refunds (Pesapal)</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Payments processed by Pesapal - supports MTN MoMo Uganda, Airtel Money, Visa/Mastercard, auto verified, no manual Transaction ID</li>
              <li>Sandbox testing uses tiny amounts 100-300 UGX due to TestOnly 1000 KES limit. Real production charges real UGX 15k/35k/75k</li>
              <li>Refunds: If site not working and we can't fix in 48 hrs, full refund. Email support@voidbuild.com with transaction ID and reason</li>
              <li>Failed payments: If MoMo fails, you can retry, no double charge. Check /api/pesapal/token to test Pesapal auth</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">6. Intellectual Property</h2>
            <p className="mt-2">You own your content (business name, text, images you upload). VoidBuild owns builder code, templates structure, logo. Templates are licensed to you for your sites while subscribed. If you cancel, your published sites may be removed after 30 days grace (export before cancel via Save & Get Link with ?d= base64 data in URL).</p>
          </section>

          <section>
            <h2 className="font-bold text-base">7. Limitation of Liability</h2>
            <p className="mt-2">VoidBuild provides builder as-is, best effort, no warranty. Not liable for lost business due to downtime, AI generation errors, or payment failures. Max liability limited to amount you paid in last 3 months. For $0 free plan, max liability $0.</p>
          </section>

          <section>
            <h2 className="font-bold text-base">8. Changes & Contact</h2>
            <p className="mt-2">We may update terms, will notify via email or dashboard banner. Continued use after update means acceptance. For questions: support@voidbuild.com or WhatsApp +256 774 919318. Built in Kampala for Ugandan SMEs.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t flex gap-4 text-xs">
          <Link href="/" className="hover:underline">← Home</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/builder" className="hover:underline">Builder</Link>
        </div>
      </div>
    </main>
  );
}
