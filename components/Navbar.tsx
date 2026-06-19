"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <>
      {/* Always black navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#010100] border-b border-white/[0.06]">
        <div className="px-6 md:px-14 xl:px-20 h-16 md:h-20 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.svg"
              alt="ZARAAR"
              width={110}
              height={56}
              className="h-11 md:h-14 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {[
              { label: "Collection", href: "/#collection" },
              { label: "About",      href: "/about"       },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="font-body text-[11px] font-medium tracking-[0.22em] uppercase text-white/50 hover:text-white transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <Link
            href="/#collection"
            className="hidden md:inline-flex items-center px-7 py-3 bg-[#C9A84C] text-[#0A0A0A] font-body text-[9px] font-bold tracking-[0.32em] uppercase hover:bg-white transition-colors duration-200"
          >
            Order Now
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="md:hidden flex flex-col justify-center gap-[6px] w-8 h-8 p-1"
          >
            <span className={`block h-px bg-white transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[7px] w-6" : "w-6"}`} />
            <span className={`block h-px bg-white transition-all duration-200 ${menuOpen ? "opacity-0 w-6" : "w-4"}`} />
            <span className={`block h-px bg-white transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px] w-6" : "w-6"}`} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#010100] flex flex-col items-center justify-center gap-8 md:hidden transition-opacity duration-200 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <p className="font-body text-[8px] tracking-[0.4em] uppercase text-white/25 mb-2">
          Browse by Series
        </p>
        {[
          { label: "Tissot",          href: "/#tst" },
          { label: "Hublot",          href: "/#hbl" },
          { label: "Patek Philippe",  href: "/#pp"  },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            onClick={close}
            className="font-display font-light text-3xl tracking-[0.05em] text-[#F5F5F0]/65 hover:text-[#C9A84C]"
          >
            {label}
          </Link>
        ))}

        <div className="h-px w-10 bg-[#C9A84C]/30 my-2" />

        {[
          { label: "Order", href: "/#collection" },
          { label: "About", href: "/about"  },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            onClick={close}
            className="font-display font-light text-5xl tracking-[0.05em] text-[#F5F5F0] hover:text-[#C9A84C]"
          >
            {label}
          </Link>
        ))}

        <Link
          href="/#collection"
          onClick={close}
          className="mt-4 font-body text-[9px] font-bold tracking-[0.35em] uppercase text-[#0A0A0A] bg-[#C9A84C] px-8 py-4 hover:bg-white"
        >
          Order Now
        </Link>
      </div>
    </>
  );
}
