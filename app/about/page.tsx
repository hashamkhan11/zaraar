import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "About | ZARAAR Premium Watches Pakistan",
  description: "ZARAAR imports premium watch designs and delivers them with cash on delivery across Pakistan. Operating from Faisalabad.",
};

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* ── Page Hero ── */}
      <section className="bg-[#0A0A0A] min-h-[55vh] flex flex-col justify-end px-6 md:px-14 xl:px-20 pt-20 md:pt-24 pb-14 md:pb-20">
        <p className="font-body text-[8px] tracking-[0.4em] uppercase text-[#C9A84C] mb-4">
          ZARAAR · Our Story
        </p>
        <h1 className="sr-only">About ZARAAR | Premium Watches Pakistan</h1>
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
        <div className="max-w-screen-xl mx-auto grid md:grid-cols-[2fr_1fr] gap-16 md:gap-28 items-start">

          {/* Text */}
          <div>
            <p className="font-body text-[8px] tracking-[0.38em] uppercase text-black/25 mb-8">
              Who We Are
            </p>

            <p className="font-body text-[14px] text-black/65 leading-[1.9] mb-6">
              ZARAAR was built on one belief: that a premium timepiece should not require a premium price tag. We carefully import and curate watch designs inspired by the world&rsquo;s most respected houses, Patek Philippe, Tissot, and Hublot, and bring them directly to Pakistan at honest prices, with cash on delivery.
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
              { label: "Design Series",   value: "Patek Philippe, Tissot, Hublot" },
              { label: "Orders Delivered", value: "2,000+" },
            ].map(({ label, value }) => (
              <div key={label} className="border-t border-black/[0.07] pt-5">
                <p className="font-body text-[8.5px] tracking-[0.28em] uppercase text-black/30 mb-1.5">
                  {label}
                </p>
                <p className="font-body text-[12px] font-medium text-[#0A0A0A]">
                  {value}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Mission quote ── */}
      <section className="bg-[#0F0F0F] py-20 md:py-28 px-6 md:px-14 xl:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body text-[8px] tracking-[0.38em] uppercase text-white/22 mb-8">
            Our Mission
          </p>
          <blockquote
            className="font-display font-light italic text-[#F5F5F0] leading-[1.25] tracking-tight"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 3rem)" }}
          >
            &ldquo;Make the watch that makes the man. Accessible to every man.&rdquo;
          </blockquote>
          <div className="mt-8 h-px w-10 bg-[#C9A84C]/35 mx-auto" />
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="bg-[#FAFAF8] py-20 md:py-28 px-6 md:px-14 xl:px-20">
        <div className="max-w-screen-xl mx-auto">

          <p className="font-body text-[8px] tracking-[0.38em] uppercase text-black/25 mb-8">
            Get in Touch
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                label: "WhatsApp",
                value: "Message us directly",
                href:  `https://wa.me/${WA}`,
                ext:   true,
              },
              {
                label: "TikTok",
                value: "@zaraar.shop · 90K+ Followers",
                href:  "https://www.tiktok.com/@zaraar.shop",
                ext:   true,
              },
              {
                label: "Location",
                value: "Faisalabad, Punjab, Pakistan",
                href:  null,
                ext:   false,
              },
            ].map(({ label, value, href, ext }) => (
              <div key={label} className="border-t border-black/[0.07] pt-6">
                <p className="font-body text-[8.5px] tracking-[0.28em] uppercase text-black/28 mb-2">
                  {label}
                </p>
                {href ? (
                  <a
                    href={href}
                    {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="font-body text-[13px] text-[#0A0A0A] hover:text-[#C9A84C] transition-colors duration-200 border-b border-black/15 pb-0.5"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="font-body text-[13px] text-[#0A0A0A]">{value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-14">
            <Link
              href="/"
              className="font-body text-[9px] tracking-[0.28em] uppercase text-black/35 border-b border-black/15 pb-0.5 hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors"
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
            <p className="font-body text-[8px] tracking-[0.22em] uppercase text-white/20">
              Premium Watches · Cash on Delivery · Pakistan
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-7">
            {[
              { label: "Collection", href: "/#collection"                                    },
              { label: "About",      href: "/about"                                          },
              { label: "TikTok",     href: "https://www.tiktok.com/@zaraar.shop", ext: true },
              { label: "Order Now",  href: "/#collection"                                    },
            ].map(({ label, href, ext }) => (
              <a
                key={label}
                href={href}
                {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="font-body text-[9px] tracking-[0.22em] uppercase text-white/28 hover:text-[#C9A84C] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
          <p className="font-body text-[8px] tracking-[0.22em] uppercase text-white/18">
            © 2025 ZARAAR
          </p>
        </div>
      </footer>
    </>
  );
}
