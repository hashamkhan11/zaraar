"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Package, CheckCircle2, Truck, MapPin, Clock, AlertCircle, Search, ChevronRight } from "lucide-react";

interface TrackStep {
  code: string;
  en: string;
  ur: string;
  step: number;
  timestamp: string | null;
  location: string | null;
}

interface TrackResult {
  ok: boolean;
  cn?: string;
  statusCode?: string;
  statusEn?: string;
  statusUr?: string;
  step?: number;
  estimatedDelivery?: string | null;
  history?: TrackStep[];
  error?: string;
}

const STEPS = [
  { en: "Order Placed",     ur: "آرڈر ہو گیا",          icon: Package },
  { en: "Picked Up",        ur: "پک اپ ہو گیا",          icon: CheckCircle2 },
  { en: "In Transit",       ur: "راستے میں ہے",           icon: Truck },
  { en: "Out for Delivery", ur: "ڈلیوری کے لیے نکل گیا", icon: MapPin },
  { en: "Delivered",        ur: "ڈلیور ہو گیا",           icon: CheckCircle2 },
];

function fmtTs(ts: string | null) {
  if (!ts) return null;
  try {
    return new Date(ts).toLocaleString("en-PK", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ts; }
}

function TrackContent() {
  const searchParams = useSearchParams();
  const [cn, setCn] = useState(searchParams?.get("cn") ?? "");
  const [input, setInput] = useState(searchParams?.get("cn") ?? "");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const track = useCallback(async (trackCn: string) => {
    const cleaned = trackCn.trim().toUpperCase();
    if (!cleaned) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/.netlify/functions/track-order?cn=${encodeURIComponent(cleaned)}`);
      const data: TrackResult = await res.json();
      if (data.ok) {
        setResult(data);
      } else {
        setError(data.error || "Tracking number not found. Please check and try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlCn = searchParams?.get("cn");
    if (urlCn) {
      setCn(urlCn);
      setInput(urlCn);
      track(urlCn);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCn(input);
    track(input);
    // Update URL without navigation
    window.history.replaceState(null, "", `/track?cn=${encodeURIComponent(input.trim())}`);
  };

  const currentStep = result?.step ?? 0;
  const isDelivered = result?.statusCode === "0005" || result?.statusCode === "0011";
  const isReturned  = result?.statusCode === "0007" || result?.statusCode === "0010";
  const isCancelled = result?.statusCode === "0008";

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-bold text-gray-900 tracking-tight">
            WatchesByFahad
          </Link>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Order Tracking</span>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Search box */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Track Your Order</h1>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            اپنا ٹریکنگ نمبر درج کریں • Enter your tracking number (CX-XXXXXXXXXX)
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. CX-123456789"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 uppercase placeholder:normal-case"
              style={{ letterSpacing: "0.04em" }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gray-900 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Track
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C4976A]" />
            <p className="text-sm text-gray-500">Tracking your order…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Tracking Not Found</p>
              <p className="text-xs text-red-500 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <>
            {/* Status card */}
            <div className={`rounded-2xl border p-6 shadow-sm ${
              isDelivered ? "bg-green-50 border-green-100" :
              isReturned  ? "bg-red-50 border-red-100" :
              isCancelled ? "bg-gray-50 border-gray-200" :
              "bg-blue-50 border-blue-100"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDelivered ? "bg-green-100" : isReturned || isCancelled ? "bg-red-100" : "bg-blue-100"
                }`}>
                  {isDelivered ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                   isReturned  ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                   isCancelled ? <AlertCircle className="w-5 h-5 text-gray-600" /> :
                   <Truck className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{result.cn}</p>
                  <p className="font-bold text-gray-900">{result.statusEn}</p>
                </div>
              </div>
              {/* Bilingual status */}
              <p className="text-sm text-gray-700 text-right font-medium" dir="rtl">{result.statusUr}</p>
              {result.estimatedDelivery && (
                <div className="mt-3 pt-3 border-t border-white/50 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-600">Expected: {fmtTs(result.estimatedDelivery)}</span>
                </div>
              )}
            </div>

            {/* Progress bar — only for active (non-cancelled/returned) orders */}
            {!isCancelled && !isReturned && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-5">Delivery Progress</h2>
                <div className="relative">
                  {/* Track line */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 z-0" />
                  <div
                    className="absolute top-4 left-4 h-0.5 bg-[#C4976A] z-0 transition-all duration-700"
                    style={{ width: `${Math.min(((currentStep - 1) / 4) * 100, 100)}%` }}
                  />
                  <div className="relative flex justify-between z-10">
                    {STEPS.map((s, i) => {
                      const stepNum = i + 1;
                      const done    = currentStep >= stepNum;
                      const active  = currentStep === stepNum;
                      const Icon    = s.icon;
                      return (
                        <div key={i} className="flex flex-col items-center gap-2" style={{ width: "20%" }}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                            done
                              ? "bg-[#C4976A] border-[#C4976A]"
                              : active
                              ? "bg-white border-[#C4976A]"
                              : "bg-white border-gray-200"
                          }`}>
                            <Icon className={`w-3.5 h-3.5 ${done ? "text-white" : active ? "text-[#C4976A]" : "text-gray-300"}`} />
                          </div>
                          <div className="text-center">
                            <p className={`text-[9px] font-semibold leading-tight ${done || active ? "text-gray-800" : "text-gray-400"}`}>
                              {s.en}
                            </p>
                            <p className={`text-[9px] leading-tight mt-0.5 ${done || active ? "text-gray-500" : "text-gray-300"}`} dir="rtl">
                              {s.ur}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            {result.history && result.history.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Tracking History</h2>
                <div className="space-y-0">
                  {[...result.history].reverse().map((h, i) => (
                    <div key={i} className="flex gap-3 relative">
                      {/* Vertical line */}
                      {i < result.history!.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-100" />
                      )}
                      <div className="w-5 h-5 rounded-full bg-[#C4976A]/10 border border-[#C4976A]/30 flex-shrink-0 mt-0.5 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C4976A]" />
                      </div>
                      <div className="pb-4 flex-1">
                        <p className="text-sm font-semibold text-gray-900">{h.en}</p>
                        <p className="text-xs text-gray-500 mt-0.5" dir="rtl">{h.ur}</p>
                        {(h.timestamp || h.location) && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            {h.location && <span>{h.location} • </span>}
                            {fmtTs(h.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Need help?</p>
                <p className="text-xs text-gray-500 mt-0.5">مدد چاہیے؟ واٹس ایپ کریں</p>
              </div>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923460178806"}?text=${encodeURIComponent(`Hi, I need help with my order. Tracking: ${result.cn}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition-colors"
              >
                WhatsApp <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C4976A]" />
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
