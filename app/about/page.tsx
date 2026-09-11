import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.67c2.13 0 4.14.83 5.65 2.34a7.95 7.95 0 0 1 2.34 5.65c0 4.41-3.59 8-8 8a7.93 7.93 0 0 1-4.02-1.09l-.29-.17-2.99.79.8-2.92-.19-.3a7.91 7.91 0 0 1-1.22-4.31c0-4.41 3.59-8 8-8zm-2.27 4.69c-.18 0-.47.07-.68.32-.21.25-.8.78-.8 1.91 0 1.13.82 2.22 1.05 2.49.22.27 1.92 2.92 4.65 3.93 2.23.83 2.68.67 3.16.62.49-.04 1.58-.65 1.8-1.27.22-.62.22-1.16.16-1.27-.06-.11-.23-.18-.49-.31-.27-.13-1.58-.78-1.83-.87-.24-.09-.42-.13-.6.13-.18.27-.69.87-.85 1.05-.16.18-.32.2-.59.07-.27-.13-1.14-.42-2.17-1.34-.8-.71-1.34-1.6-1.5-1.87-.16-.27-.02-.41.13-.55.13-.13.29-.34.43-.51.13-.16.18-.27.27-.45.09-.18.04-.34-.04-.47-.07-.13-.65-1.58-.89-2.16-.18-.43-.36-.46-.51-.47z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 5.82c-1.01-.94-1.62-2.26-1.62-3.71v-.11h-3.09v12.4c0 1.4-1.14 2.5-2.59 2.5-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V8.78c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.31c-1.07.02-2.14-.31-3.04-1.08-.34-.13-.63-.25-.64-.41z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "About | ZARAAR Stylish Watches Pakistan",
  description: "ZARAAR curates stylish watch designs and delivers them with cash on delivery across Pakistan. Operating from Faisalabad.",
  alternates: { canonical: "https://zaraar.shop/about/" },
};

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* ── Page Hero ── */}
      <section className="bg-[#0A0A0A] min-h-[55vh] flex flex-col justify-end px-6 md:px-14 xl:px-20 pt-20 md:pt-24 pb-14 md:pb-20">
        <p className="eyebrow-dark mb-4">
          ZARAAR · Our Story
        </p>
        <h1 className="sr-only">About ZARAAR | Stylish Watches Pakistan</h1>
        <p
          className="font-display font-light text-[#F5F5F0] leading-[0.9] tracking-[-0.02em]"
          style={{ fontSize: "clamp(3rem, 10vw, 9rem)" }}
        >
          ABOUT
        </p>
        <div className="h-px bg-[#C9A84C] my-4 md:my-5" />
        <p
          className="font-display font-light text-[#F5F5F0] leading-[0.9] tracking-[-0.02em]"
          style={{ fontSize: "clamp(3rem, 10vw, 9rem)" }}
        >
          ZARAAR.
        </p>
      </section>

      {/* ── Story ── */}
      <section className="bg-[#FAFAF8] py-20 md:py-32 px-6 md:px-14 xl:px-20">
        <div className="max-w-screen-xl mx-auto">

          <div className="flex justify-center mb-16 md:mb-20">
            <Image
              src="/about/zaraar-box.webp"
              alt="ZARAAR branded packaging box"
              width={900}
              height={766}
              loading="lazy"
              className="w-[200px] sm:w-[260px] md:w-[320px] h-auto"
            />
          </div>

          <div className="grid md:grid-cols-[2fr_1fr] gap-16 md:gap-28 items-start">

          {/* Text */}
          <div>
            <p className="eyebrow-light mb-8">
              Who We Are
            </p>

            <p className="font-body text-[14px] text-black/65 leading-[1.9] mb-6">
              ZARAAR was built on one belief: that a stylish timepiece should not require an unaffordable price tag. We design and curate our own watch collections and bring them directly to Pakistan at honest prices, with cash on delivery.
            </p>
            <p className="font-body text-[14px] text-black/65 leading-[1.9] mb-6">
              Every watch in our collection is selected with intention. We inspect each piece before it ships and stand behind the quality. If you&rsquo;re not satisfied, we make it right. That&rsquo;s the ZARAAR promise.
            </p>
            <p className="font-body text-[14px] text-black/65 leading-[1.9]">
              We operate out of Faisalabad and deliver to every city across Pakistan. Lahore, Karachi, Islamabad, Rawalpindi, Multan, Peshawar, and beyond. Pay when your watch arrives at your door. No advance. No risk.
            </p>

            <div className="mt-10 h-px w-14 bg-[#C9A84C]/40" />
          </div>

          {/* Sidebar — quick facts */}
          <div className="flex flex-col gap-8 md:pt-16">
            {[
              { label: "Based In",        value: "Faisalabad, Pakistan" },
              { label: "Delivery",        value: "Nationwide · 2 to 3 Days" },
              { label: "Payment",         value: "Cash on Delivery Only" },
              { label: "Design Series",   value: "Classic, Urban, Skeleton, Prestige" },
              { label: "Orders Delivered", value: "2,000+" },
            ].map(({ label, value }) => (
              <div key={label} className="border-t border-black/[0.07] pt-5">
                <p className="eyebrow-light mb-1.5">
                  {label}
                </p>
                <p className="font-body text-[12px] font-medium text-[#0A0A0A]">
                  {value}
                </p>
              </div>
            ))}
          </div>

          </div>
        </div>
      </section>

      {/* ── Mission quote ── */}
      <section className="bg-[#0F0F0F] py-20 md:py-28 px-6 md:px-14 xl:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow-dark mb-8">
            Our Mission
          </p>
          <blockquote
            className="font-display font-light italic text-[#F5F5F0] leading-[1.25] tracking-tight"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 3rem)" }}
          >
            &ldquo;Style should never be out of reach. A watch that marks every story, at a price that respects it.&rdquo;
          </blockquote>
          <div className="mt-8 h-px w-10 bg-[#C9A84C]/35 mx-auto" />
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="bg-[#FAFAF8] py-20 md:py-28 px-6 md:px-14 xl:px-20">
        <div className="max-w-screen-xl mx-auto">

          <p className="eyebrow-light mb-3">
            Get in Touch
          </p>
          <h2
            className="font-display font-light text-[#0A0A0A] mb-12 md:mb-16"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
          >
            We&rsquo;re here to help.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                label: "WhatsApp",
                value: "Message us directly",
                href:  `https://wa.me/${WA}`,
                icon:  <WhatsAppIcon className="w-5 h-5" />,
              },
              {
                label: "TikTok",
                value: "@zaraar.shop · 90K+ Followers",
                href:  "https://www.tiktok.com/@zaraar.shop",
                icon:  <TikTokIcon className="w-5 h-5" />,
              },
              {
                label: "Location",
                value: "Faisalabad, Punjab, Pakistan",
                href:  "https://www.google.com/maps/search/?api=1&query=Faisalabad%2C+Punjab%2C+Pakistan",
                icon:  <MapPin className="w-5 h-5" strokeWidth={1.5} />,
              },
            ].map(({ label, value, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block bg-white border border-black/[0.06] p-7 overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.09)] hover:border-[#C9A84C]/35 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A84C] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />

                <div className="flex items-start justify-between mb-6">
                  <div className="w-11 h-11 rounded-full bg-[#0A0A0A] flex items-center justify-center text-[#C9A84C] group-hover:bg-[#C9A84C] group-hover:text-[#0A0A0A] transition-colors duration-300">
                    {icon}
                  </div>
                  <ArrowUpRight
                    className="w-4 h-4 text-black/15 group-hover:text-[#C9A84C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                    strokeWidth={1.5}
                  />
                </div>

                <p className="eyebrow-light mb-2">
                  {label}
                </p>
                <p className="font-body text-[13px] font-medium text-[#0A0A0A] group-hover:text-[#C9A84C] transition-colors duration-200">
                  {value}
                </p>
              </a>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/"
              className="eyebrow-light border-b border-black/20 pb-0.5 hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors"
            >
              ← Back to Collection
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
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
              { label: "Collection", href: "/#collection"                                    },
              { label: "About",      href: "/about"                                          },
              { label: "Privacy",    href: "/privacy"                                        },
              { label: "TikTok",     href: "https://www.tiktok.com/@zaraar.shop", ext: true },
              { label: "Order Now",  href: "/#collection"                                    },
            ].map(({ label, href, ext }) => (
              <a
                key={label}
                href={href}
                {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="eyebrow-dark hover:text-[#C9A84C] transition-colors"
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
    </>
  );
}
