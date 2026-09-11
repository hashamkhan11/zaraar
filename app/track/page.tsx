"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface HistoryItem {
  message: string;
  code: string;
}

interface TrackResult {
  trackingNumber: string;
  status: string;
  cityName: string;
  orderDetail: string;
  history: HistoryItem[];
}

interface OrderSummary {
  trackingNumber: string;
  productName: string;
  status: string;
  createdAt: string | null;
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  "Delivered":                    { bg: "bg-green-50",  text: "text-green-700",  label: "Delivered" },
  "Out For Delivery":             { bg: "bg-sky-50",    text: "text-sky-700",    label: "Out for Delivery" },
  "Booked":                       { bg: "bg-indigo-50", text: "text-indigo-700", label: "Booked" },
  "Picked By PostEx":             { bg: "bg-indigo-50", text: "text-indigo-700", label: "Picked Up" },
  "PostEx WareHouse":             { bg: "bg-indigo-50", text: "text-indigo-700", label: "At PostEx Warehouse" },
  "En-Route to PostEx warehouse": { bg: "bg-indigo-50", text: "text-indigo-700", label: "En Route to PostEx" },
  "Attempted":                    { bg: "bg-amber-50",  text: "text-amber-700",  label: "Delivery Attempted" },
  "Delivery Under Review":        { bg: "bg-amber-50",  text: "text-amber-700",  label: "Under Review" },
  "Out For Return":               { bg: "bg-rose-50",   text: "text-rose-700",   label: "Out for Return" },
  "Returned":                     { bg: "bg-purple-50", text: "text-purple-700", label: "Returned" },
  "Expired":                      { bg: "bg-red-50",    text: "text-red-700",    label: "Expired" },
};

const CODE_ICON: Record<string, string> = {
  "0001": "◎",
  "0003": "◉",
  "0004": "→",
  "0005": "✓",
  "0006": "↩",
  "0007": "↩",
  "0008": "⏳",
  "0013": "↺",
};

function TrackingContent() {
  const params = useSearchParams();
  const [mode, setMode]         = useState<"cn" | "phone">(params.get("cn") ? "cn" : "phone");
  const [cn, setCn]             = useState(params.get("cn") ?? "");
  const [phone, setPhone]       = useState("");
  const [orders, setOrders]     = useState<OrderSummary[] | null>(null);
  const [result, setResult]     = useState<TrackResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function fetchByCn(trackingNumber: string) {
    const trimmed = trackingNumber.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setResult(null);
    setOrders(null);
    try {
      const res = await fetch(
        `/.netlify/functions/postex-track?cn=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();
      if (data.ok) {
        setResult(data as TrackResult);
      } else {
        setError(data.error || "Order not found. Please check your tracking number.");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchByPhone(phoneNumber: string) {
    const trimmed = phoneNumber.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setResult(null);
    setOrders(null);
    try {
      const res = await fetch(
        `/.netlify/functions/postex-track?phone=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();
      if (data.ok) {
        if (data.orders.length === 1) {
          fetchByCn(data.orders[0].trackingNumber);
        } else {
          setOrders(data.orders as OrderSummary[]);
          setLoading(false);
        }
      } else {
        setError(data.error || "No orders found for this phone number.");
        setLoading(false);
      }
    } catch {
      setError("Unable to connect. Please try again.");
      setLoading(false);
    }
  }

  useEffect(() => {
    const initial = params.get("cn");
    if (initial) fetchByCn(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusStyle = result ? (STATUS_STYLE[result.status] ?? { bg: "bg-gray-50", text: "text-gray-700", label: result.status }) : null;

  return (
    <>
      <Navbar />

      {/* ── Page Hero ── */}
      <section className="bg-[#0A0A0A] min-h-[42vh] flex flex-col justify-end px-6 md:px-14 xl:px-20 pt-20 md:pt-24 pb-14 md:pb-16">
        <p className="eyebrow-dark mb-4">
          ZARAAR · Order Tracking
        </p>
        <h1 className="sr-only">Track Your ZARAAR Order</h1>
        <p
          className="font-display font-light text-[#F5F5F0] leading-[0.9] tracking-[-0.02em]"
          style={{ fontSize: "clamp(2.6rem, 9vw, 6.5rem)" }}
        >
          TRACK YOUR
        </p>
        <div className="h-px bg-[#C9A84C] my-4 md:my-5" />
        <p
          className="font-display font-light text-[#F5F5F0] leading-[0.9] tracking-[-0.02em]"
          style={{ fontSize: "clamp(2.6rem, 9vw, 6.5rem)" }}
        >
          ORDER.
        </p>
      </section>

      {/* ── Search & Results ── */}
      <section className="bg-[#FAFAF8] py-16 md:py-24 px-6 md:px-14 xl:px-20 min-h-[40vh]">
        <div className="max-w-xl mx-auto">
          <p className="eyebrow-light mb-3 text-center">
            Find Your Shipment
          </p>
          <p className="font-body text-[12px] text-black/45 text-center mb-10">
            Search by the phone number used at checkout, or your PostEx tracking number.
          </p>

          {/* Mode toggle */}
          <div className="flex border border-black/10 mb-6 w-fit mx-auto bg-white">
            {([
              { key: "phone", label: "Phone Number" },
              { key: "cn",    label: "Tracking Number" },
            ] as const).map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => { setMode(t.key); setError(""); setResult(null); setOrders(null); }}
                className={`px-5 py-2.5 font-body text-[9px] font-bold tracking-[0.22em] uppercase transition-colors duration-200 ${
                  mode === t.key ? "bg-[#0A0A0A] text-white" : "text-black/40 hover:text-black/70"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {mode === "phone" ? (
            <form
              onSubmit={e => { e.preventDefault(); fetchByPhone(phone); }}
              className="flex gap-3 bg-white border border-black/[0.07] px-5 py-1"
            >
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 03001234567"
                className="flex-1 zaraar-input-light font-mono text-sm !border-b-0 !pb-0"
              />
              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="my-2.5 px-6 py-2.5 bg-[#0A0A0A] text-white font-body text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-[#C9A84C] hover:text-[#0A0A0A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "…" : "Track"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); fetchByCn(cn); }}
              className="flex gap-3 bg-white border border-black/[0.07] px-5 py-1"
            >
              <input
                type="text"
                value={cn}
                onChange={e => setCn(e.target.value)}
                placeholder="e.g. 10001234567"
                className="flex-1 zaraar-input-light font-mono text-sm !border-b-0 !pb-0"
              />
              <button
                type="submit"
                disabled={loading || !cn.trim()}
                className="my-2.5 px-6 py-2.5 bg-[#0A0A0A] text-white font-body text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-[#C9A84C] hover:text-[#0A0A0A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "…" : "Track"}
              </button>
            </form>
          )}

          {/* Error */}
          {error && (
            <div className="mt-8 border border-red-200 bg-red-50 px-5 py-4 text-center">
              <p className="font-body text-[12px] text-red-700">{error}</p>
            </div>
          )}

          {/* Multiple orders found — let customer pick one */}
          {orders && orders.length > 1 && (
            <div className="mt-8 border border-black/[0.07] bg-white">
              <div className="px-5 py-3 border-b border-black/[0.06]">
                <p className="eyebrow-light">Select an Order</p>
              </div>
              <div className="divide-y divide-black/[0.05]">
                {orders.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => fetchByCn(o.trackingNumber)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-black/[0.02] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-body text-[12px] font-semibold text-[#0A0A0A] truncate">{o.productName}</p>
                      <p className="font-mono text-[10px] text-black/40 mt-0.5">{o.trackingNumber}</p>
                    </div>
                    <span className="flex-shrink-0 font-body text-[9px] font-bold tracking-[0.15em] uppercase px-2.5 py-1 bg-black/[0.04] text-black/60">
                      {o.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && statusStyle && (
            <div className="mt-10 space-y-6">
              {/* Status card */}
              <div className="border border-black/[0.07] bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="eyebrow-light mb-2">Tracking Number</p>
                    <p className="font-mono font-bold text-[#0A0A0A] text-base">{result.trackingNumber}</p>
                    {result.cityName && (
                      <p className="font-body text-[11px] text-black/40 mt-1">{result.cityName}</p>
                    )}
                  </div>
                  <span className={`flex-shrink-0 font-body text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.label}
                  </span>
                </div>
                {result.orderDetail && (
                  <p className="font-body text-[11px] text-black/50 mt-4 pt-4 border-t border-black/[0.06]">
                    {result.orderDetail}
                  </p>
                )}
              </div>

              {/* Timeline */}
              {result.history.length > 0 && (
                <div className="border border-black/[0.07] bg-white">
                  <div className="px-5 py-3 border-b border-black/[0.06]">
                    <p className="eyebrow-light">Shipment Timeline</p>
                  </div>
                  <div className="divide-y divide-black/[0.05]">
                    {[...result.history].reverse().map((item, i) => (
                      <div key={i} className="flex items-start gap-4 px-5 py-4">
                        <span className={`flex-shrink-0 w-7 h-7 flex items-center justify-center text-base ${i === 0 ? "text-[#C9A84C]" : "text-black/20"}`}>
                          {CODE_ICON[item.code] ?? "·"}
                        </span>
                        <p className={`font-body text-[12px] pt-0.5 ${i === 0 ? "text-[#0A0A0A] font-semibold" : "text-black/45"}`}>
                          {item.message || item.code}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="font-body text-[10px] text-center text-black/30">
                Powered by PostEx · Status updates every 30 minutes
              </p>
            </div>
          )}

          {!result && !orders && !error && (
            <div className="mt-12 text-center">
              <Link
                href="/#collection"
                className="eyebrow-light border-b border-black/20 pb-0.5 hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors"
              >
                ← Back to Collection
              </Link>
            </div>
          )}
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

export default function TrackPage() {
  return (
    <Suspense>
      <TrackingContent />
    </Suspense>
  );
}
