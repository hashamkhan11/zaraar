import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Privacy Policy | ZARAAR",
  description: "ZARAAR privacy policy — how we collect, use, and protect your information when you order watches from zaraar.shop.",
  alternates: { canonical: "https://zaraar.shop/privacy/" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#FAFAF8] min-h-screen pt-28 md:pt-36 pb-20 md:pb-28 px-6 md:px-14 xl:px-20">
        <div className="max-w-3xl mx-auto">

          <p className="font-body text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#6B5A35] mb-4">
            Legal
          </p>
          <h1
            className="font-display font-light text-[#0A0A0A] leading-[0.95] tracking-tight mb-8"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Privacy Policy
          </h1>
          <p className="font-body text-[11px] text-black/40 mb-12">
            Last updated: June 2025
          </p>

          <div className="space-y-10 font-body text-[13.5px] text-black/65 leading-[1.9]">

            <section>
              <h2 className="font-display font-light text-[1.2rem] text-[#0A0A0A] mb-3">1. Who We Are</h2>
              <p>
                ZARAAR (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates zaraar.shop, an online watch store based in Faisalabad, Pakistan. We sell timepieces under the ZARAAR brand and deliver nationwide with cash on delivery. For privacy-related questions, contact us on WhatsApp.
              </p>
            </section>

            <section>
              <h2 className="font-display font-light text-[1.2rem] text-[#0A0A0A] mb-3">2. Information We Collect</h2>
              <p>When you place an order, we collect:</p>
              <ul className="mt-3 space-y-1.5 list-none pl-0">
                {[
                  "Full name",
                  "Mobile phone number",
                  "City",
                  "Delivery address",
                  "Order details (product, price, quantity)",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#C9A84C] mt-[3px] shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                We do not collect payment card details. All payments are made in cash at the time of delivery.
              </p>
            </section>

            <section>
              <h2 className="font-display font-light text-[1.2rem] text-[#0A0A0A] mb-3">3. How We Use Your Information</h2>
              <p>We use the information you provide solely to:</p>
              <ul className="mt-3 space-y-1.5 list-none pl-0">
                {[
                  "Process and fulfill your order",
                  "Contact you to confirm your order via phone or WhatsApp",
                  "Arrange delivery with our courier partner",
                  "Handle returns, refunds, or delivery issues",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#C9A84C] mt-[3px] shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-display font-light text-[1.2rem] text-[#0A0A0A] mb-3">4. Information Sharing</h2>
              <p>
                We share your name, phone number, and delivery address with our courier partner (PostEx or Leopard Courier) solely to complete your delivery. We do not sell, rent, or share your personal information with any third party for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="font-display font-light text-[1.2rem] text-[#0A0A0A] mb-3">5. Cookies and Analytics</h2>
              <p>
                Our website uses the TikTok Pixel to measure the effectiveness of our advertising. This may involve setting a cookie in your browser. The TikTok Pixel collects anonymised event data (such as page views and purchases) to help us understand which ads are working. No personally identifiable information is shared with TikTok without your consent.
              </p>
              <p className="mt-3">
                You can opt out of TikTok interest-based advertising at any time via TikTok&rsquo;s privacy settings.
              </p>
            </section>

            <section>
              <h2 className="font-display font-light text-[1.2rem] text-[#0A0A0A] mb-3">6. Data Retention</h2>
              <p>
                We retain your order information for up to 12 months for customer service and accounting purposes. After that period, personally identifiable information is deleted from our records.
              </p>
            </section>

            <section>
              <h2 className="font-display font-light text-[1.2rem] text-[#0A0A0A] mb-3">7. Your Rights</h2>
              <p>
                You have the right to request access to the personal information we hold about you, to request its correction or deletion, and to withdraw consent for us to contact you. To exercise any of these rights, message us on WhatsApp.
              </p>
            </section>

            <section>
              <h2 className="font-display font-light text-[1.2rem] text-[#0A0A0A] mb-3">8. Security</h2>
              <p>
                We take reasonable precautions to protect your personal information from unauthorised access or disclosure. Our website is served over HTTPS and we do not store payment information.
              </p>
            </section>

            <section>
              <h2 className="font-display font-light text-[1.2rem] text-[#0A0A0A] mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date at the top of this page will reflect any changes. Continued use of our website after changes are posted constitutes your acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="font-display font-light text-[1.2rem] text-[#0A0A0A] mb-3">10. Contact</h2>
              <p>
                For any privacy-related questions or requests, please contact us via WhatsApp. We aim to respond within 24 hours.
              </p>
            </section>

          </div>

          <div className="mt-16 pt-8 border-t border-black/[0.07]">
            <Link
              href="/"
              className="font-body text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#6B5A35] border-b border-black/20 pb-0.5 hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors"
            >
              ← Back to Collection
            </Link>
          </div>

        </div>
      </main>

      <footer className="bg-[#0A0A0A] border-t border-white/[0.05] px-6 md:px-14 xl:px-20 py-10">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-0">
          <p className="font-display font-light text-[1.1rem] tracking-[0.55em] text-[#F5F5F0] uppercase">ZARAAR</p>
          <div className="flex flex-wrap items-center gap-7">
            {[
              { label: "Collection", href: "/" },
              { label: "About",      href: "/about" },
              { label: "Privacy",    href: "/privacy" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="font-body text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#D9C896] hover:text-[#C9A84C] transition-colors">
                {label}
              </Link>
            ))}
          </div>
          <p className="font-body text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[#D9C896]">© 2025 ZARAAR</p>
        </div>
      </footer>
    </>
  );
}
