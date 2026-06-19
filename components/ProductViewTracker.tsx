"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/tiktok";

interface Props {
  id: string;
  name: string;
  price: number;
}

export default function ProductViewTracker({ id, name, price }: Props) {
  useEffect(() => {
    trackEvent("ViewContent", {
      content_id: id,
      content_name: name,
      content_type: "product",
      value: price,
      currency: "PKR",
    });
  }, [id, name, price]);

  return null;
}
