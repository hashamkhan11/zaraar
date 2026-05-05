import type { Metadata } from "next";
import { Shield, Truck, RefreshCw } from "lucide-react";
import { catalog } from "@/data/catalog";
import GroupCard from "@/components/GroupCard";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "WatchesByFahad — Premium Watches | Cash on Delivery Pakistan",
  description:
    "Shop premium watches with cash on delivery across Pakistan. PP and TST collections — multiple styles, free delivery, 7-day returns.",
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Preload hero images — browser fetches before parsing CSS/JS */}
      <link rel="preload" as="image" href="/hero-bg-mobile.webp" media="(max-width: 767px)" />
      <link rel="preload" as="image" href="/hero-bg.webp" media="(min-width: 768px)" />
      {/* ── Hero ── */}
      <section className="bg-white pt-3 px-3 sm:px-4">
        <div className="relative h-[calc(100vh-5rem)] min-h-[500px] max-h-[920px] overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] bg-black">
          <picture>
            <source media="(min-width: 768px)" srcSet="/hero-bg.webp" type="image/webp" />
            <source media="(max-width: 767px)" srcSet="/hero-bg-mobile.webp" type="image/webp" />
            <img
              src="/hero-bg.webp"
              alt="Premium watch collection"
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="eager"
              fetchPriority="high"
            />
          </picture>

          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 left-0 w-[45%] h-[45%] bg-gradient-to-br from-black/50 to-transparent hidden md:block" />
          <div className="absolute bottom-0 right-0 w-[45%] h-[45%] bg-gradient-to-tl from-black/55 to-transparent hidden md:block" />
          <div className="absolute top-0 left-0 right-0 h-[52%] bg-gradient-to-b from-black/65 via-black/30 to-transparent md:hidden" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Desktop headline */}
          <div className="absolute top-10 left-10 hidden md:block z-10">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#C4976A] mb-3">
              The Collection
            </p>
            <h1
              className="font-display text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.1]"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}
            >
              Premium<br />Watches.
            </h1>
          </div>
          <div className="absolute bottom-12 right-10 hidden md:block z-10 text-right">
            <p
              className="font-display text-4xl lg:text-5xl font-medium text-[#C4976A] tracking-wide leading-[1.1]"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.45)" }}
            >
              Affordable<br />Prices.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-4">
              <div className="h-px w-8 bg-white/30" />
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/50 font-medium">
                Cash on Delivery
              </span>
            </div>
          </div>

          {/* Mobile headline */}
          <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-20 px-6 md:hidden z-10">
            <h1 className="font-display text-[2.5rem] font-semibold text-white text-center tracking-tight leading-[1.15]">
              Premium Watches.
            </h1>
            <p className="font-display text-[1.7rem] font-medium text-[#C4976A] text-center tracking-wide mt-1.5">
              Affordable Prices.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <div className="h-px w-10 bg-white/30" />
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/50 font-medium">
                Cash on Delivery
              </span>
              <div className="h-px w-10 bg-white/30" />
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <a
              href="#products"
              className="flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Scroll to collection"
            >
              <span className="text-[9px] uppercase tracking-[0.2em] text-white font-medium">
                Shop Now
              </span>
              <svg className="w-4 h-4 text-white animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Truck,     label: "Free Delivery",    sub: "All Pakistan" },
              { icon: Shield,    label: "Cash on Delivery", sub: "Pay on arrival" },
              { icon: RefreshCw, label: "Easy Returns",     sub: "7-day policy" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1 py-1">
                <Icon className="w-4 h-4 text-[#8B5E3C] mb-1" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-gray-900">{label}</span>
                <span className="text-[11px] text-gray-400">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Collection ── */}
      <section id="products" className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">

          {/* Section eyebrow */}
          <div className="mb-12">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#C4976A] mb-2">
              The Collection
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight leading-tight">
              Browse All Styles
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Hover any color swatch to preview. Tap to select, then order.
            </p>
          </div>

          {/* Brand sections */}
          <div className="space-y-16">
            {catalog.map((brand) => (
              <div key={brand.id}>
                {/* Brand divider */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="h-px w-8 bg-gray-900 flex-shrink-0" />
                  <span className="font-display text-2xl font-semibold text-gray-900 tracking-tight flex-shrink-0">
                    {brand.name}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400 flex-shrink-0 hidden sm:block">
                    {brand.groups.length} style{brand.groups.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {brand.groups.map((group, i) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      priority={i === 0 && brand.id === catalog[0].id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── City strip ── */}
      <section className="bg-[#0F0A06] py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#C4976A] mb-3">
            Delivering Across All Pakistan
          </p>
          <p className="text-[#D4B896] text-sm tracking-widest leading-loose mb-5">
            Karachi · Lahore · Islamabad · Faisalabad · Rawalpindi · Multan
            <span className="hidden sm:inline">
              {" "}· Peshawar · Abbottabad · Sialkot · Gujranwala · Quetta · Bahawalpur
            </span>
          </p>
          <p className="text-[11px] text-[#8B7355] leading-relaxed">
            Cities above are our highest customer areas — but we ship everywhere in Pakistan.
          </p>
          <p className="text-[11px] text-[#8B7355] mt-1.5 leading-relaxed">
            Operating from Faisalabad · Delivery in 3–5 business days depending on your location.
          </p>
        </div>
      </section>

      {/* ── TikTok ── */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black flex items-center justify-center flex-shrink-0">
                <TikTokIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">See them in motion</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  HD videos of every watch before you order
                </p>
              </div>
            </div>
            <a
              href="https://www.tiktok.com/@watchesbyfahad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white text-[11px] font-medium tracking-[0.12em] uppercase px-7 py-3.5 hover:bg-[#1C1008] transition-colors"
            >
              <TikTokIcon className="w-3.5 h-3.5" />
              Watch on TikTok
            </a>
          </div>
        </div>
      </section>

      {/* ── How to order ── */}
      <section className="bg-[#0F0A06] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#C4976A] mb-2">
              Simple Process
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight">
              How to Order
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Pick a Watch",      desc: "Browse the collection and choose the one that suits you." },
              { step: "02", title: "Fill Your Details", desc: "Name, phone, and address. Takes under a minute." },
              { step: "03", title: "Receive & Pay",     desc: "We deliver. You inspect. You pay. That simple." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <p className="font-display text-5xl font-semibold text-white mb-4">{step}</p>
                <div className="w-8 h-px bg-[#C4976A] mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-white mb-2 tracking-widest uppercase">{title}</h3>
                <p className="text-sm text-[#8B7355] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </>
  );
}
