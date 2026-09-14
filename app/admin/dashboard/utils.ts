import { useState } from "react";
import { CATALOG } from "@/data/products";
import { Order, OrderStatus, getOrderItems, getOrderQuantity, getOrderTotal } from "@/lib/orders";
import { DateFilter } from "./types";

// ─── Catalog flat list ────────────────────────────────────────────────────────
export const allVariants = CATALOG.map(p => ({
  id:    p.id,
  name:  `${p.name} | ${p.seriesName}`,
  price: p.price,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function stockDelta(prev: OrderStatus, next: OrderStatus, qty: number): number {
  if (prev !== "delivered"         && next === "delivered")         return -qty;
  if (prev === "delivered"         && next !== "delivered")         return +qty;
  if (prev !== "returned"          && next === "returned")          return +qty;
  if (prev === "returned"          && next !== "returned")          return -qty;
  if (prev !== "return_in_transit" && next === "return_in_transit") return +qty;
  if (prev === "return_in_transit" && next !== "return_in_transit") return -qty;
  return 0;
}

export function fmtDate(d: unknown) {
  let date: Date | null = null;
  if (d instanceof Date) date = d;
  else if (d && typeof (d as { toDate?: unknown }).toDate === "function") {
    date = (d as { toDate: () => Date }).toDate();
  }
  if (!date) return "—";
  return date.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function fmtDay(d: Date) {
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

export function orderAgeHours(o: Order) {
  if (!(o.createdAt instanceof Date)) return 0;
  return (Date.now() - o.createdAt.getTime()) / 3600000;
}

export function dateRangeFor(f: DateFilter): { start: Date; end: Date } | null {
  if (f === "all") return null;
  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  if (f === "today") return { start: today, end: now };
  if (f === "yesterday") {
    const y = new Date(today); y.setDate(y.getDate() - 1);
    const ye = new Date(today); ye.setMilliseconds(-1);
    return { start: y, end: ye };
  }
  if (f === "week")  { const s = new Date(today); s.setDate(s.getDate() - 6);  return { start: s, end: now }; }
  if (f === "month") { const s = new Date(today); s.setDate(s.getDate() - 29); return { start: s, end: now }; }
  return null;
}

export function exportCSV(orders: Order[]) {
  const header = ["ID","Name","Phone","City","Address","Product","Qty","Price","Total","Status","Courier","CN","Date","Note"];
  const rows = orders.map(o => {
    const items = getOrderItems(o);
    const productCell = items.length > 1
      ? `"${items.map(i => `${i.productName} x${i.quantity}`).join("; ").replace(/"/g,'""')}"`
      : o.productName;
    return [
      o.id, o.name, o.phone, o.city,
      o.address ? `"${o.address.replace(/"/g,'""')}"` : "",
      productCell, getOrderQuantity(o), o.price, getOrderTotal(o),
      o.status, o.courierName ?? "", o.trackingNumber ?? "",
      o.createdAt instanceof Date ? o.createdAt.toISOString() : "",
      o.note ? `"${o.note.replace(/"/g,'""')}"` : "",
    ];
  });
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export const OPEN_PARCEL_NOTE = "Allow customer to open parcel before payment / Parcel khulwa kar check karny dein.";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zaraar.shop";
export function trackUrl(cn: string) {
  return `${SITE_URL}/track?cn=${encodeURIComponent(cn)}`;
}

// Builds the PostEx booking payload fields for an order. Single-product orders
// keep the exact legacy shape (price/quantity passed through as-is). Multi-item
// orders collapse to a combined description + quantity:1 + the full COD total,
// with the true piece count passed separately via `pieces` so PostEx parcel
// metadata stays accurate without risking COD rounding.
export function postexParamsFor(order: Order): { productName: string; price: number; quantity: number; pieces?: number } {
  const items = getOrderItems(order);
  if (items.length <= 1) {
    return { productName: order.productName, price: order.price, quantity: order.quantity };
  }
  return {
    productName: items.map(i => `${i.productName} x${i.quantity}`).join(", "),
    price: getOrderTotal(order),
    quantity: 1,
    pieces: getOrderQuantity(order),
  };
}

// ─── useCopy ──────────────────────────────────────────────────────────────────
export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
}

// ─── Alert sound ──────────────────────────────────────────────────────────────
export function playNewOrderSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    ([0, 0.18, 0.36] as const).forEach((t, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = [880, 1100, 1320][i];
      gain.gain.setValueAtTime(0.28, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.28);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.28);
    });
  } catch { /* ignore in SSR or restricted contexts */ }
}
