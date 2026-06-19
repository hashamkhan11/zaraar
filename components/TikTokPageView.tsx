"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import "@/lib/tiktok";

export default function TikTokPageView() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // The base pixel snippet already fires the first ttq.page() on load.
    // Only fire again on subsequent client-side route changes.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (typeof window !== "undefined" && window.ttq) {
      window.ttq.page();
    }
  }, [pathname]);

  return null;
}
