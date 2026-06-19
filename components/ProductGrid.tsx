"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ZararProduct } from "@/data/products";
import QuickBuyModal from "@/components/QuickBuyModal";

interface Props {
  products: ZararProduct[];
  columns?: 3 | 4;
}

export default function ProductGrid({ products, columns = 4 }: Props) {
  const [quickBuy, setQuickBuy] = useState<ZararProduct | null>(null);

  const gridCols = columns === 3
    ? "grid-cols-1 sm:grid-cols-3 lg:grid-cols-3"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <>
      <div className={`grid ${gridCols} gap-5 md:gap-7`}>
        {products.map(product => {
          const discount = Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) * 100,
          );
          return (
            <div
              key={product.id}
              className="group flex flex-col bg-white border border-black/[0.07] hover:border-[#C9A84C] active:border-[#C9A84C] transition-colors duration-300"
            >
              {/* Image — tappable, opens product details */}
              <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden block">
                <Image
                  src={product.image}
                  alt={`ZARAAR ${product.name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-contain p-6 group-hover:scale-[1.04] group-active:scale-[1.04] transition-transform duration-700 ease-out"
                />

                {/* Gold hover/tap bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A84C] translate-y-full group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-500 ease-out" />

                {/* Tag */}
                {product.tag && (
                  <div className="absolute top-3 left-3 font-body text-[7.5px] font-bold tracking-[0.3em] uppercase text-white bg-[#0A0A0A] px-2 py-1">
                    {product.tag}
                  </div>
                )}

                {/* Discount chip */}
                <div className="absolute top-3 right-3 font-body text-[7.5px] font-bold tracking-[0.15em] text-[#C9A84C] bg-[#0A0A0A] px-2 py-1">
                  −{discount}%
                </div>
              </Link>

              {/* Info */}
              <div className="flex flex-col flex-1 px-4 pt-3 pb-4 border-t border-black/[0.06]">
                {/* Title — tappable, opens product details */}
                <Link href={`/product/${product.id}`} className="block">
                  <h4 className="font-display font-light text-[1.1rem] tracking-[0.08em] text-[#0A0A0A] uppercase group-hover:text-[#C9A84C] group-active:text-[#C9A84C] transition-colors duration-300 leading-tight">
                    {product.name}
                  </h4>
                  <p className="font-body text-[9px] tracking-[0.18em] uppercase text-black/50 mt-0.5 italic">
                    {product.tagline}
                  </p>
                </Link>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                  <span className="font-body text-[13px] font-semibold text-[#0A0A0A]">
                    PKR {product.price.toLocaleString()}
                  </span>
                  <span className="font-body text-[11px] text-black/45 line-through">
                    {product.originalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1.5 mb-4 space-y-0.5">
                  <p className="font-body text-[8.5px] tracking-[0.1em] text-black/45">
                    Rs. 200 Delivery · Total PKR {(product.price + 200).toLocaleString()}
                  </p>
                  <p className="font-body text-[8px] tracking-[0.08em] text-black/35">
                    Save PKR {(product.originalPrice - product.price).toLocaleString()} on product
                  </p>
                </div>

                {/* Action buttons — pushed to bottom of card */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => setQuickBuy(product)}
                    className="flex-1 bg-[#0A0A0A] text-white font-body text-[7.5px] font-bold tracking-[0.22em] uppercase py-3 hover:bg-[#C9A84C] hover:text-[#0A0A0A] active:bg-[#C9A84C] active:text-[#0A0A0A] transition-colors duration-200"
                  >
                    Quick Buy
                  </button>
                  <Link
                    href={`/product/${product.id}`}
                    className="flex-1 border border-black/15 text-[#0A0A0A] font-body text-[7.5px] font-bold tracking-[0.22em] uppercase py-3 text-center hover:border-[#C9A84C] hover:text-[#C9A84C] active:border-[#C9A84C] active:text-[#C9A84C] transition-colors duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <QuickBuyModal product={quickBuy} onClose={() => setQuickBuy(null)} />
    </>
  );
}
