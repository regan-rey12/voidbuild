import Link from 'next/link';
import TopNav from '@/components/TopNav';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopNav currentPage="home" />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Terms of Service - VoidBuild</h1>
        <p className="text-xs text-gray-500 mt-2">Last updated: August 14, 2026 • voidbuild.com</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="font-bold text-base">1. What VoidBuild Does</h2>
            <p className="mt-2">VoidBuild is an AI website builder for Ugandan SMEs. You describe your business, and our system generates a professional website with UGX pricing, WhatsApp booking, and map integration. You can customize text, photos, and publish to your custom subdomain or attached domain. Hosting is included.</p>
          </section>

          <section>
            <h2 className="font-bold text-base">2. Plans &amp; Pricing (UGX)</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Free:</strong> 1 website, voidbuild.com link, WhatsApp booking button. Free forever with no card required.</li>
              <li><strong>Starter UGX 15,000/mo:</strong> 1 website, custom subdomain, 5k monthly visits, fast Africa edge loading.</li>
              <li><strong>Business UGX 35,000/mo (Popular):</strong> 3 websites, custom domain ready, visitor analytics, priority WhatsApp support.</li>
              <li><strong>Pro UGX 75,000/mo:</strong> 10 websites, unlimited visits, online store catalog, VIP onboarding.</li>
              <li>Prices in UGX, paid securely via Pesapal with MTN MoMo, Airtel Money, or Card. No hidden fees or unexpected renewal hikes.</li>
              <li>Cancel anytime in your dashboard or by emailing hello@voidbuild.com.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">3. Your Responsibilities</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>You own your business content — ensure you have rights to images and text you upload.</li>
              <li>No illegal content, hate speech, or scams. We reserve the right to suspend websites violating Ugandan law or our acceptable use policy.</li>
              <li>Keep login accounts secure — magic links expire within 1 hour.</li>
              <li>For custom domains, you must configure your domain DNS CNAME records to point to voidbuild.com.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">4. Our Responsibilities</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Provide website hosting and subdomain routing with 99.9% target uptime.</li>
              <li>Maintain AI generation with instant fallback to 15 Ugandan templates if upstream providers are busy.</li>
              <li>Protect your data with Supabase user isolation, HTTPS encryption, and zero storage of MoMo PINs or bank card numbers.</li>
              <li>Provide customer support via WhatsApp (+256 751 391318) and email (hello@voidbuild.com) within 24 hours.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">5. Payments &amp; Refunds (Pesapal)</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Payments are processed securely via Pesapal — supporting MTN MoMo Uganda, Airtel Money, and Visa/Mastercard with instant automated verification.</li>
              <li>Subscription plans are billed monthly in UGX (Starter UGX 15,000 / Business UGX 35,000 / Pro UGX 75,000).</li>
              <li>Refunds: If your website or subscription encounters a technical failure we cannot resolve within 48 hours, a full refund is issued upon request to hello@voidbuild.com.</li>
              <li>Failed payments: If Mobile Money network timeouts occur during checkout, you can retry anytime without double charging.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">6. Intellectual Property</h2>
            <p className="mt-2">You own your business data (name, text, products, photos). VoidBuild owns the builder engine, template designs, and brand assets. If you cancel, your published websites remain active until the end of your billing cycle.</p>
          </section>

          <section>
            <h2 className="font-bold text-base">7. Limitation of Liability</h2>
            <p className="mt-2">VoidBuild is provided as-is on a best-effort basis. Maximum liability is limited to the subscription amount paid in the preceding 3 months.</p>
          </section>

          <section>
            <h2 className="font-bold text-base">8. Contact &amp; Support</h2>
            <p className="mt-2">For inquiries, partnerships, or support: Email hello@voidbuild.com or WhatsApp +256 751 391318. Built in Kampala, Uganda for East African SMEs.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="VoidBuild" className="w-5 h-5 object-contain flex-shrink-0" />
            <span>© 2026 voidbuild — Built for Uganda</span>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/pricing" className="hover:underline">Pricing</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
