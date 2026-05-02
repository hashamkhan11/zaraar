"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";

const TIKTOK_URL = "https://www.tiktok.com/@watchesbyfahad";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

export default function Navbar() {
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-[#1C1008]">
      <div className="max-w-6xl mx-auto px-4 h-16 relative flex items-center">

        {/* Left */}
        <div className="flex items-center gap-5">
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="flex items-center gap-1.5 text-[11px] font-medium tracking-widest uppercase text-[#C4976A] hover:text-white transition-colors"
          >
            <TikTokIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TikTok</span>
          </a>
          <Link
            href="/#products"
            className="hidden sm:block text-[11px] font-medium tracking-widest uppercase text-[#C4976A] hover:text-white transition-colors"
          >
            Shop
          </Link>
        </div>

        {/* Center — logo absolutely centered so it isn't column-width constrained on mobile */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" aria-label="WatchesByFahad home">
            <Image
              src="/logo.svg"
              alt="WatchesByFahad"
              width={220}
              height={42}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-medium text-[#C4976A] border border-[#3D2010] px-3 py-1.5 rounded-full tracking-wide">
            <span className="w-1.5 h-1.5 bg-[#C4976A] rounded-full animate-pulse" />
            Cash on Delivery
          </span>
          <button
            id="checkout-btn"
            onClick={openCart}
            aria-label="Open cart"
            className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#1C1008] transition-colors"
          >
            <ShoppingBag className="w-5 h-5 text-white" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C4976A] text-black text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
