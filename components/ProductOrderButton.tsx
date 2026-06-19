"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { ZararProduct } from "@/data/products";
import QuickBuyModal from "@/components/QuickBuyModal";

interface Props {
  product: ZararProduct;
  className: string;
  children?: ReactNode;
}

export default function ProductOrderButton({ product, className, children = "Order Now" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <QuickBuyModal product={open ? product : null} onClose={() => setOpen(false)} />
    </>
  );
}
