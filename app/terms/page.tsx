import Link from 'next/link';
import TopNav from '@/components/TopNav';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopNav currentPage="home" />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Terms of Service - VoidBuild</h1>
        <p className="text-xs text-gray-500 mt-2">Last updated: August 26, 2026 • voidbuild.com</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="font-bold text-base">1. What VoidBuild Does</h2>
            <p className="mt-2">
              VoidBuild is a website builder for Ugandan SMEs. You describe your business, and our system helps generate a professional website with UGX pricing, WhatsApp contact, and map-ready sections. You can customize text, photos, and publish to your VoidBuild subdomain. Hosting is included. Custom domain connection is being rolled out gradually and may be handled manually for selected Business and Pro customers.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base">2. Plans &amp; Pricing (UGX)</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Free:</strong> 1 website, voidbuild.com link, WhatsApp booking button. Free forever with no card required.</li>
              <li><strong>Starter UGX 50,000/year:</strong> 1 website, custom subdomain, 5k monthly visits, fast Africa edge loading.</li>
              <li><strong>Business UGX 100,000/year (Popular):</strong> 3 websites, visitor analytics, priority WhatsApp support, and assisted domain connection rollout.</li>
              <li><strong>Pro UGX 200,000/year:</strong> 10 websites, unlimited visits, online store catalog, VIP onboarding, and domain connection priority.</li>
              <li>Prices are in UGX and payments are processed securely via Pesapal using MTN MoMo, Airtel Money, or card.</li>
              <li>Subscription cancellation is currently handled through support by emailing hello@voidbuild.com or messaging +256 751 391318.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">3. Your Responsibilities</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>You own your business content and should ensure you have rights to the images, product details, and text you upload.</li>
              <li>No illegal content, hate speech, fraud, or scams. We may suspend websites that violate Ugandan law or our acceptable use standards.</li>
              <li>Keep your login access secure. Magic-link sign-in depends on access to your email account.</li>
              <li>If you request a custom domain during the current rollout, you may need to complete DNS changes with our support guidance before the domain goes live.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">4. Our Responsibilities</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Provide website hosting and VoidBuild subdomain routing on a best-effort basis with a 99.9% target uptime.</li>
              <li>Maintain AI generation with fallback Ugandan templates if upstream providers are unavailable.</li>
              <li>Protect project, payment, analytics, and lead data using Supabase access controls, HTTPS encryption, and server-side processing.</li>
              <li>Provide customer support via WhatsApp (+256 751 391318) and email (hello@voidbuild.com).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">5. Payments &amp; Refunds (Pesapal)</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Payments are processed securely via Pesapal — supporting MTN MoMo Uganda, Airtel Money, and Visa/Mastercard.</li>
              <li>Subscription plans are billed yearly in UGX (Starter UGX 50,000 / Business UGX 100,000 / Pro UGX 200,000).</li>
              <li>If a technical payment issue occurs and we cannot confirm or fix it within a reasonable support window, contact hello@voidbuild.com for assistance.</li>
              <li>Failed or abandoned payments do not activate a plan until our system verifies the payment successfully.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base">6. Intellectual Property</h2>
            <p className="mt-2">
              You own your business data such as names, text, products, and photos. VoidBuild owns the builder engine, template system, and VoidBuild brand assets.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base">7. Limitation of Liability</h2>
            <p className="mt-2">VoidBuild is provided on a best-effort basis. Maximum liability is limited to the subscription amount paid in the preceding 3 months, to the extent permitted by law.</p>
          </section>

          <section>
            <h2 className="font-bold text-base">8. Contact &amp; Support</h2>
            <p className="mt-2">For support, billing, cancellations, partnerships, or custom-domain rollout requests: Email hello@voidbuild.com or WhatsApp +256 751 391318. Built in Kampala, Uganda.</p>
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
