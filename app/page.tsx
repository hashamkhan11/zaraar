import type { Metadata } from "next";
import Link from "next/link";
import Navbar         from "@/components/Navbar";
import Marquee        from "@/components/Marquee";
import ProductGrid    from "@/components/ProductGrid";
import FAQ            from "@/components/FAQ";
import BackToTopButton from "@/components/BackToTopButton";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { CATALOG, SERIES } from "@/data/products";

export const metadata: Metadata = {
  title: "Buy Stylish Watches Online Pakistan | Cash on Delivery | ZARAAR",
  description: "Buy stylish ZARAAR watches online in Pakistan with cash on delivery. Unique designs, affordable prices. Rs. 200 delivery. Ships in 2 to 3 days. 2,000+ orders delivered.",
  alternates: { canonical: "https://zaraar.shop/" },
};

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000";

const SITE = "https://zaraar.shop";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ZARAAR",
  "url": SITE,
  "logo": `${SITE}/logo.svg`,
  "description": "ZARAAR is a Pakistani watch brand selling its own uniquely designed Classic, Skeleton, and Prestige series timepieces with cash on delivery across Pakistan.",
  "address": { "@type": "PostalAddress", "addressLocality": "Faisalabad", "addressCountry": "PK" },
  "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "availableLanguage": ["en", "ur"] },
  "sameAs": ["https://www.tiktok.com/@zaraar.shop"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ZARAAR",
  "url": SITE,
  "description": "Buy stylish watches online in Pakistan with cash on delivery.",
  "inLanguage": "en-PK",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Are ZARAAR watches original designer brand watches?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. ZARAAR is completely upfront about this. ZARAAR sells its own independently designed and manufactured timepieces under the ZARAAR brand. No third-party brand affiliation is claimed." },
    },
    {
      "@type": "Question",
      "name": "How do I buy a watch from ZARAAR?",
      "acceptedAnswer": { "@type": "Answer", "text": "Fill the order form on zaraar.shop with your name, phone number, city, and address. We confirm your order within the hour. You pay cash only when your watch arrives at your door. No advance payment." },
    },
    {
      "@type": "Question",
      "name": "What is the delivery charge for ZARAAR watches?",
      "acceptedAnswer": { "@type": "Answer", "text": "There is a flat Rs. 200 delivery charge on all orders, nationwide across Pakistan. No additional charges." },
    },
    {
      "@type": "Question",
      "name": "How long does ZARAAR delivery take in Pakistan?",
      "acceptedAnswer": { "@type": "Answer", "text": "Orders placed before 4pm are dispatched the same day. Sunday orders are dispatched on Monday. Delivery normally takes 2 to 3 business days across all of Pakistan. In rare cases it can take up to 5 days." },
    },
    {
      "@type": "Question",
      "name": "Can I return a ZARAAR watch?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. ZARAAR offers a 7-day full refund policy. If you are unsatisfied for any reason, contact via WhatsApp within 7 days of delivery and a full refund is issued. No questions asked." },
    },
    {
      "@type": "Question",
      "name": "Does ZARAAR deliver to all cities in Pakistan?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. ZARAAR delivers to all cities across Pakistan including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, and everywhere else." },
    },
  ],
};

export default function ZaraarPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar />

      {/* ═══════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen bg-[#0A0A0A] flex flex-col justify-between px-6 md:px-14 xl:px-20 pt-24 md:pt-28 pb-10">

        {/* Top meta */}
        <div className="flex items-center justify-between">
          <p className="eyebrow-dark">
            Stylish Timepieces
          </p>
          <p className="eyebrow-dark">
            Est. Pakistan
          </p>
        </div>

        {/* Headline block */}
        <div className="py-10 md:py-0">

          <h1 className="sr-only">Buy Stylish Watches Online in Pakistan with Cash on Delivery | ZARAAR</h1>

          <div className="overflow-hidden">
            <p
              className="font-display font-light leading-[0.9] tracking-[-0.02em] text-[#F5F5F0]"
              style={{ fontSize: "clamp(2.8rem, 9.5vw, 9.5rem)" }}
            >
              SOME THINGS
            </p>
          </div>

          <div className="h-px bg-[#C9A84C] my-3 md:my-4" />

          <div className="overflow-hidden">
            <p
              className="font-display font-light leading-[0.9] tracking-[-0.02em] text-[#F5F5F0]"
              style={{ fontSize: "clamp(2.8rem, 9.5vw, 9.5rem)" }}
            >
              DON&rsquo;T NEED
            </p>
          </div>

          <div className="overflow-hidden flex flex-col md:flex-row md:items-end md:justify-between gap-8 md:gap-0">
            <p
              className="font-display font-light leading-[0.9] tracking-[-0.02em] text-[#F5F5F0]"
              style={{ fontSize: "clamp(2.8rem, 9.5vw, 9.5rem)" }}
            >
              INTRODUCTION.
            </p>

            {/* Desktop CTA */}
            <div className="hidden md:flex flex-col items-end gap-5 shrink-0 pb-1">
              <p className="eyebrow-dark text-right leading-relaxed">
                Cash on Delivery<br />Rs. 200 Delivery Charge
              </p>
              <Link
                href="#collection"
                className="inline-flex items-center gap-3 bg-[#F5F5F0] text-[#0A0A0A] px-8 py-4 font-body text-[9px] font-bold tracking-[0.32em] uppercase hover:bg-[#C9A84C] transition-colors duration-300"
              >
                Explore Collection
                <ArrowRight className="w-3.5 h-2.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="md:hidden">
          <Link
            href="#collection"
            className="inline-flex items-center gap-3 bg-[#F5F5F0] text-[#0A0A0A] px-7 py-4 font-body text-[9px] font-bold tracking-[0.32em] uppercase hover:bg-[#C9A84C] transition-colors duration-300"
          >
            Explore Collection <ArrowRight className="w-3.5 h-2.5" />
          </Link>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-white/[0.06] pt-6 flex items-center justify-between">
          <p className="eyebrow-dark">
            Rs. 200 Delivery Charge
          </p>
          <p className="eyebrow-dark">
            2 to 3 Business Days
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MARQUEE
      ═══════════════════════════════════════════════════════ */}
      <Marquee />

      {/* ═══════════════════════════════════════════════════════
          COLLECTION — 3 design series
      ═══════════════════════════════════════════════════════ */}
      <div id="collection" className="bg-[#EBEAE6]">

        {/* Collection masthead */}
        <div className="px-6 md:px-14 xl:px-20 pt-24 md:pt-32 pb-16">
          <p className="eyebrow-light mb-4">
            01 / The Collection
          </p>
          <h2
            className="font-display font-light text-[#0A0A0A] tracking-tight leading-[1]"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Five Design Series.<br />One Standard of Excellence.
          </h2>
        </div>

        {/* Each series */}
        {SERIES.map((series, si) => {
          const products = CATALOG.filter(p => p.seriesId === series.id);
          return (
            <div
              key={series.id}
              id={series.id}
              className={`px-6 md:px-14 xl:px-20 py-14 md:py-20 ${si % 2 === 1 ? "bg-[#E3E2DE]" : "bg-[#EBEAE6]"}`}
            >
              {/* Series header */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-14">
                <div>
                  <p className="eyebrow-light mb-2">
                    0{si + 1} / Design Series
                  </p>
                  <h3
                    className="font-display font-light text-[#0A0A0A] tracking-tight leading-[1]"
                    style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)" }}
                  >
                    {series.name}
                  </h3>
                  <p className="font-body text-[11px] text-black/40 mt-3 max-w-md leading-relaxed">
                    {series.description}
                  </p>
                </div>
                <div className="h-px w-16 bg-[#C9A84C]/40 md:mb-2 shrink-0" />
              </div>

              {/* Product grid */}
              <ProductGrid products={products} columns={products.length === 3 ? 3 : 4} />
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════
          BRAND STATEMENT
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#0F0F0F] py-24 md:py-36 px-6 md:px-14 xl:px-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid md:grid-cols-[2.6fr_1fr] gap-16 md:gap-28 items-start">

            <div>
              <p className="eyebrow-dark mb-10">
                02 / Philosophy
              </p>
              <blockquote
                className="font-display font-light italic text-[#F5F5F0] leading-[1.22] tracking-tight"
                style={{ fontSize: "clamp(1.6rem, 4vw, 3.4rem)" }}
              >
                &ldquo;The right watch doesn&rsquo;t just tell time. It tells people who you are.&rdquo;
              </blockquote>
              <div className="mt-10 h-px w-14 bg-[#C9A84C]/35" />
            </div>

            <div className="flex flex-row md:flex-col gap-8 md:gap-0 md:pt-24 flex-wrap">
              {[
                { num: "2,000+", label: "Happy Customers" },
                { num: "Rs. 200", label: "Delivery Charge"  },
                { num: "2 to 3",  label: "Day Delivery"    },
              ].map(({ num, label }, i) => (
                <div
                  key={label}
                  className={`flex-1 md:flex-none ${i > 0 ? "md:border-t md:border-white/[0.06] md:pt-7 md:mt-7" : ""}`}
                >
                  <p
                    className="font-display font-light leading-none mb-1.5 text-[#C9A84C]"
                    style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
                  >
                    {num}
                  </p>
                  <p className="eyebrow-dark">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TIKTOK
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#0A0A0A] py-20 md:py-28 px-6 md:px-14 xl:px-20 border-t border-white/[0.05]">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12">

            {/* Left */}
            <div className="max-w-lg">
              <p className="eyebrow-dark mb-6">
                03 / TikTok
              </p>
              <h2
                className="font-display font-light text-[#F5F5F0] tracking-tight leading-[1]"
                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
              >
                90K+ Followers<br />on TikTok.
              </h2>
              <p className="font-body text-[11px] text-white/40 mt-5 leading-relaxed max-w-sm">
                Every watch filmed, worn, and reviewed before you order. No surprises. No risk. Just the real thing on your wrist.
              </p>

              <a
                href="https://www.tiktok.com/@zaraar.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 mt-8 bg-[#F5F5F0] text-[#0A0A0A] px-8 py-4 font-body text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-[#C9A84C] transition-colors duration-300"
              >
                <TikTokIcon className="w-3.5 h-3.5" />
                Visit Our TikTok
              </a>
            </div>

            {/* Right — stat block */}
            <div className="flex flex-col gap-6 md:gap-8 shrink-0">
              {[
                { num: "90K+",  label: "TikTok Followers"  },
                { num: "100%",  label: "Real Product Videos" },
                { num: "Every", label: "Watch Filmed"       },
              ].map(({ num, label }) => (
                <div key={label} className="border-l border-[#C9A84C]/30 pl-5">
                  <p className="font-display font-light text-2xl md:text-3xl text-[#F5F5F0] leading-none">
                    {num}
                  </p>
                  <p className="eyebrow-dark mt-1.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          OUR PROMISE
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#F5F4F0] py-20 md:py-28 px-6 md:px-14 xl:px-20">
        <div className="max-w-screen-xl mx-auto">

          <div className="mb-14">
            <p className="eyebrow-light mb-4">
              04 / Our Promise
            </p>
            <h2
              className="font-display font-light text-[#0A0A0A] tracking-tight leading-[1]"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
            >
              What You Can Expect.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-black/[0.07]">
            {[
              {
                title:  "Quality Assured",
                body:   "Not satisfied with your purchase? We accept returns and issue a full refund, no questions asked. We stand behind every watch we ship.",
                detail: "Hassle-Free Returns",
              },
              {
                title:  "2 to 3 Day Delivery",
                body:   "Your watch reaches your door in 2 to 3 business days, anywhere in Pakistan. Lahore, Karachi, Islamabad, everywhere. Rs. 200 flat delivery charge.",
                detail: "Rs. 200 Nationwide",
              },
              {
                title:  "Cash on Delivery",
                body:   "Pay only when your watch is in your hands. Zero advance payment, zero risk. Your trust is the only currency we accept before delivery.",
                detail: "No Advance. Pay on Arrival",
              },
            ].map(({ title, body, detail }, i) => (
              <div
                key={title}
                className={`py-10 md:py-12 ${i < 2 ? "md:pr-10 xl:pr-14 md:border-r border-black/[0.07]" : ""} ${i > 0 ? "border-t border-black/[0.07] md:border-t-0 md:pl-10 xl:pl-14" : ""}`}
              >
                <div className="h-px w-8 bg-[#C9A84C] mb-7" />
                <h3 className="font-display font-light text-[1.3rem] tracking-[0.04em] text-[#0A0A0A] mb-3 leading-tight">
                  {title}
                </h3>
                <p className="font-body text-[12.5px] text-black/55 leading-[1.9] mb-6">
                  {body}
                </p>
                <p className="font-body text-[8.5px] font-bold tracking-[0.25em] uppercase text-[#C9A84C]">
                  {detail}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════ */}
      <FAQ />

      {/* ═══════════════════════════════════════════════════════
          WHATSAPP COMMUNITY
      ═══════════════════════════════════════════════════════ */}
      <section id="community" className="bg-[#0D0D0D] py-20 md:py-28 px-6 md:px-14 xl:px-20">
        <div className="max-w-screen-xl mx-auto flex flex-col items-center text-center">
          <p className="eyebrow-dark mb-4">
            05 / Join The Community
          </p>
          <h2
            className="font-display font-light text-[#F5F5F0] tracking-tight leading-[1.05] max-w-2xl"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
          >
            Never Miss A Drop.
          </h2>
          <p className="font-body text-[13px] text-white/45 leading-[1.8] max-w-md mt-5 mb-9">
            Join our WhatsApp community for first access to new designs, restocks, and member-only offers. No spam, just watches.
          </p>
          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent("Hi! I'd like to join the ZARAAR WhatsApp community for new drops and offers.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-9 py-4 bg-[#C9A84C] text-[#0A0A0A] font-body text-[9px] font-bold tracking-[0.32em] uppercase hover:bg-white transition-colors duration-200"
          >
            Join on WhatsApp
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="bg-[#0A0A0A] border-t border-white/[0.05] px-6 md:px-14 xl:px-20 py-10">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-0">

          <div>
            <p className="font-display font-light text-[1.1rem] tracking-[0.55em] text-[#F5F5F0] uppercase mb-1.5">
              ZARAAR
            </p>
            <p className="eyebrow-dark">
              Stylish Watches · Cash on Delivery · Pakistan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-7">
            {[
              { label: "Collection", href: "#collection"                                    },
              { label: "About",      href: "/about"                                         },
              { label: "Privacy",    href: "/privacy"                                       },
              { label: "TikTok",     href: "https://www.tiktok.com/@zaraar.shop", ext: true },
              { label: "WhatsApp",   href: `https://wa.me/${WA}`,                 ext: true },
            ].map(({ label, href, ext }) => (
              <a
                key={label}
                href={href}
                {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="eyebrow-dark hover:text-[#C9A84C] transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </div>

          <p className="eyebrow-dark">
            © 2025 ZARAAR
          </p>
        </div>
      </footer>

      <BackToTopButton />
      <WhatsAppFloatButton />
    </>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 18 10" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 5h16M12 1l5 4-5 4" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}
