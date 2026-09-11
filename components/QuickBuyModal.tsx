"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ZararProduct } from "@/data/products";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { trackEvent, capiFirePurchase, sha256 } from "@/lib/tiktok";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000";
const DELIVERY_FEE = 200;

interface Props {
  product: ZararProduct | null;
  onClose: () => void;
}

type Status = "idle" | "submitting" | "error";
type FieldKey = "name" | "phone" | "city" | "address";

function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s-]/g, "");
  if (p.startsWith("+92")) p = "0" + p.slice(3);
  else if (p.startsWith("92") && p.length === 12) p = "0" + p.slice(2);
  return p;
}

function isValidPhone(raw: string): boolean {
  return /^03\d{9}$/.test(normalizePhone(raw));
}

export default function QuickBuyModal({ product: incomingProduct, onClose }: Props) {
  const router = useRouter();
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [city, setCity]       = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus]   = useState<Status>("idle");
  const [errors, setErrors]   = useState<Partial<Record<FieldKey, string>>>({});
  const [localProduct, setLocalProduct] = useState<ZararProduct | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (incomingProduct) {
      document.body.style.overflow = "hidden";
      setStatus("idle");
      setName(""); setPhone(""); setCity(""); setAddress(""); setErrors({});
      setLocalProduct(incomingProduct);
      const viewProps = {
        content_id: incomingProduct.id,
        content_name: `${incomingProduct.name} | ${incomingProduct.seriesName}`,
        content_type: "product",
        value: incomingProduct.price,
        currency: "PKR",
      };
      trackEvent("AddToCart", viewProps);
      trackEvent("InitiateCheckout", viewProps);
      // Pre-warm Firestore + prefetch the confirmation page chunk while
      // the user fills in their details. doc() triggers SDK init; prefetch
      // ensures router.push("/order-confirmed") navigates instantly.
      doc(collection(db, "orders"));
      router.prefetch("/order-confirmed");
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const t = setTimeout(() => {
        setLocalProduct(null);
        document.body.style.overflow = "";
      }, 300);
      return () => clearTimeout(t);
    }
  }, [incomingProduct]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!localProduct) return null;
  const product = localProduct;

  function validate(): Partial<Record<FieldKey, string>> {
    const errs: Partial<Record<FieldKey, string>> = {};
    if (!name.trim()) errs.name = "Required";
    if (!phone.trim()) errs.phone = "Required";
    else if (!isValidPhone(phone)) errs.phone = "Enter a valid mobile number, e.g. 0300 1234567";
    if (!city.trim()) errs.city = "Required";
    if (!address.trim()) errs.address = "Required";
    return errs;
  }

  const waFallback = () => {
    const msg = encodeURIComponent(
      `Order: ZARAAR\nWatch: ${product.name} | ${product.seriesName}\n\nName: ${name}\nMobile: ${phone}\nCity: ${city}\nAddress: ${address}`,
    );
    window.open(`https://wa.me/${WA}?text=${msg}`, "_blank");
  };

  function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("submitting");
    try {
      const finalPrice  = product!.price + DELIVERY_FEE;
      const productName = `${product!.name} | ${product!.seriesName}`;

      // Allocate doc ref synchronously — stable ID, zero network calls
      const orderRef = doc(collection(db, "orders"));
      const orderId  = orderRef.id;

      // ── Navigate IMMEDIATELY — zero awaits before this line ──────────────
      // The /order-confirmed chunk is already prefetched (done when modal opened),
      // so this transition is instant for the user.
      const params = new URLSearchParams({ e: orderId, p: product!.id, n: productName, v: String(finalPrice) });
      router.push(`/order-confirmed?${params.toString()}`);

      // ── Everything below runs in background, after navigation ─────────────
      // Snapshot form values before component unmounts
      const nameSnap = name, phoneSnap = normalizePhone(phone),
            citySnap = city, addrSnap  = address;

      // Hash phone + fire CAPI (server-side TikTok event) in background
      sha256(phoneSnap).then(hashedPhone =>
        capiFirePurchase(orderId, {
          content_id:   product!.id,
          content_name: productName,
          content_type: "product",
          value:        finalPrice,
          currency:     "PKR",
        }, { phone: hashedPhone })
      );

      // Firestore write — uses connection pre-warmed when modal opened
      setDoc(orderRef, {
        productId: product!.id, productName,
        price: finalPrice, quantity: 1,
        name: nameSnap, phone: phoneSnap, city: citySnap, address: addrSnap,
        status: "pending",
        createdAt: serverTimestamp(),
      }).catch(() => {
        try {
          sessionStorage.setItem("zaraar_pending_order", JSON.stringify({
            orderId, productName, finalPrice,
            name: nameSnap, phone: phoneSnap, city: citySnap, address: addrSnap,
            at: new Date().toISOString(),
          }));
        } catch {}
      });
    } catch {
      waFallback();
      onClose();
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end md:items-center justify-center transition-colors duration-300 ${visible ? "bg-black/55" : "bg-black/0"}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-white w-full md:max-w-[440px] md:mx-6 transition-all duration-300 ease-out ${
          visible ? "translate-y-0 opacity-100 md:scale-100" : "translate-y-full opacity-0 md:translate-y-0 md:scale-95"
        }`}
      >

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-black/[0.07]">
          <div>
            <p className="eyebrow-light mb-1">
              Quick Order
            </p>
            <h3 className="font-display font-light text-[1.35rem] tracking-[0.08em] text-[#0A0A0A] uppercase leading-tight">
              {product.name}
            </h3>
            <p className="font-body text-[10px] text-black/60 mt-0.5">
              PKR {product.price.toLocaleString()} &nbsp;·&nbsp; {product.seriesName}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="font-body text-[13px] text-black/45 hover:text-[#0A0A0A] transition-colors mt-0.5 ml-4 shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleOrder} className="px-6 py-6 flex flex-col gap-5">
          {([
            { key: "name",    label: "Full Name",         val: name,    set: setName,    ph: "e.g. Ahmed Khan",    type: "text" },
            { key: "phone",   label: "Mobile Number",     val: phone,   set: setPhone,   ph: "e.g. 0300 1234567",  type: "tel"  },
            { key: "city",    label: "City",              val: city,    set: setCity,    ph: "e.g. Lahore",         type: "text" },
            { key: "address", label: "Complete Address",  val: address, set: setAddress, ph: "Street, Area, City",  type: "text" },
          ] as const).map(({ key, label, val, set, ph, type }) => (
            <div key={key}>
              <label className="font-body text-[9px] font-semibold tracking-[0.3em] uppercase text-black/60 block mb-2">
                {label}
              </label>
              <input
                type={type}
                value={val}
                onChange={e => {
                  set(e.target.value);
                  if (errors[key]) setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
                }}
                placeholder={ph}
                className="zaraar-input-light"
                style={errors[key] ? { borderBottomColor: "#dc2626" } : undefined}
              />
              {errors[key] && (
                <p className="font-body text-[9.5px] text-red-600 mt-1.5">{errors[key]}</p>
              )}
            </div>
          ))}

          <div className="pt-1 flex flex-col gap-3">
            {/* Price breakdown */}
            <div className="border-t border-black/[0.08] pt-3 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-body text-[10px] text-black/50">Product Price</span>
                <span className="font-body text-[10px] text-black/70">PKR {product.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-[10px] text-black/50">Delivery Charges</span>
                <span className="font-body text-[10px] text-black/70">Rs. 200</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-black/[0.08]">
                <span className="font-body text-[10px] font-bold tracking-[0.1em] uppercase text-[#0A0A0A]">Total Payable</span>
                <span className="font-body text-[14px] font-bold text-[#0A0A0A]">PKR {(product.price + 200).toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full bg-[#0A0A0A] text-white font-body text-[9px] font-bold tracking-[0.35em] uppercase py-4 hover:bg-[#C9A84C] hover:text-[#0A0A0A] active:bg-[#C9A84C] active:text-[#0A0A0A] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? "Placing Order..." : "Place Order"}
            </button>
            <p className="font-body text-[8.5px] text-center text-black/45">
              Cash on delivery &nbsp;·&nbsp; Confirmed within the hour
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
