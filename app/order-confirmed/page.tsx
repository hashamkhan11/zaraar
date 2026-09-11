"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { pixelFirePurchase } from "@/lib/tiktok";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000";

function OrderConfirmedContent() {
  const params      = useSearchParams();
  const eventId     = params.get("e") ?? "";
  const productId   = params.get("p") ?? "";
  const productName = params.get("n") ?? "Your Watch";
  const price       = Number(params.get("v") ?? 0);
  const firedRef    = useRef(false);

  useEffect(() => {
    if (!eventId || firedRef.current) return;
    firedRef.current = true;
    // Browser pixel — pairs with the CAPI call made before redirect.
    // TikTok deduplicates both signals into 1 conversion using eventId.
    pixelFirePurchase(eventId, {
      content_id:   productId,
      content_name: productName,
      content_type: "product",
      value:        price,
      currency:     "PKR",
    });
  }, [eventId, productId, productName, price]);

  const waMsg = encodeURIComponent(
    `Hi! I just placed an order for ${productName}. Please confirm my order.`
  );

  return (
    <main className="min-h-screen bg-[#010100] flex flex-col items-center justify-center px-6 pt-28 pb-14">

      {/* Check icon */}
      <div className="flex items-center justify-center w-16 h-16 border border-[#C9A84C]/40 mb-8">
        <svg className="w-7 h-7 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      {/* Heading */}
      <p className="font-body text-[10px] font-bold tracking-[0.35em] uppercase text-[#C9A84C] mb-4">
        Order Confirmed
      </p>
      <h1 className="font-display font-light text-[2rem] md:text-[2.6rem] tracking-[0.04em] text-[#F5F5F0] text-center leading-tight mb-2">
        Thank You
      </h1>
      <p className="font-display font-light text-base tracking-[0.06em] text-[#F5F5F0]/45 text-center mb-10">
        {productName}
      </p>

      {/* Order summary card */}
      <div className="w-full max-w-sm border border-white/[0.08] bg-white/[0.03] px-7 py-6 mb-8 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-body text-[11px] tracking-[0.15em] uppercase text-white/40">Watch price</span>
          <span className="font-body text-[13px] text-[#F5F5F0]">PKR {(price - 200).toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body text-[11px] tracking-[0.15em] uppercase text-white/40">Delivery</span>
          <span className="font-body text-[13px] text-[#F5F5F0]">PKR 200</span>
        </div>
        <div className="h-px bg-white/[0.08]" />
        <div className="flex justify-between items-center">
          <span className="font-body text-[11px] font-bold tracking-[0.2em] uppercase text-white/60">Total (COD)</span>
          <span className="font-body text-[15px] font-semibold text-[#C9A84C]">PKR {price.toLocaleString()}</span>
        </div>
      </div>

      {/* Confirmation note */}
      <p className="font-body text-[12px] text-white/40 text-center leading-relaxed max-w-xs mb-10">
        We will call you within the hour to confirm your order.
        Pay only when your watch arrives at your door.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <a
          href={`https://wa.me/${WA}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE57] text-white font-body text-[9px] font-bold tracking-[0.28em] uppercase py-4 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.42 1.27 4.87L2 22l5.25-1.37A9.97 9.97 0 0012.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10zm4.96 14.25c-.2.56-1.17 1.07-1.62 1.14-.44.07-.98.1-1.58-.1-.37-.12-.84-.28-1.44-.55-2.52-1.09-4.17-3.6-4.3-3.77-.12-.17-.99-1.32-.99-2.51 0-1.2.63-1.79.85-2.03.22-.25.48-.31.64-.31l.46.01c.15.01.35-.06.54.41.2.48.69 1.68.75 1.8.06.12.1.27.02.43-.08.17-.12.27-.23.41l-.35.41c-.11.12-.23.25-.1.49.13.24.58.95 1.24 1.54.85.76 1.57 1 1.79 1.11.22.11.35.09.48-.05.13-.14.56-.66.71-.88.15-.22.3-.18.51-.11.2.07 1.28.6 1.5.71.21.11.36.17.41.26.05.1.05.57-.15 1.13z"/>
          </svg>
          WhatsApp Us
        </a>
        <Link
          href="/"
          className="flex-1 flex items-center justify-center border border-white/20 text-white/70 hover:text-[#C9A84C] hover:border-[#C9A84C] active:text-[#C9A84C] active:border-[#C9A84C] font-body text-[9px] font-bold tracking-[0.28em] uppercase py-4 transition-colors duration-150"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#010100] flex items-center justify-center">
        <div className="w-6 h-6 border border-[#C9A84C]/40 border-t-[#C9A84C] rounded-full animate-spin" />
      </main>
    }>
      <OrderConfirmedContent />
    </Suspense>
  );
}
