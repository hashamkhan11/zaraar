"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  subscribeToOrders, updateOrderStatus, updateOrder, deleteOrder, createOrder,
  Order, OrderStatus, OrderData,
} from "@/lib/orders";
import { subscribeToStock, setStock, adjustStock, StockMap } from "@/lib/stock";
import { catalog } from "@/data/catalog";

// Flat list of every variant — matches the productId format used in orders ({groupId}-{variantId})
const allVariants = catalog.flatMap(cat =>
  cat.groups.flatMap(g =>
    g.variants.map(v => ({
      id:    `${g.id}-${v.id}`,
      name:  `${g.fullName} — ${v.name}`,
      price: g.price,
    }))
  )
);
import Link from "next/link";
import {
  LogOut, Loader2, CheckCheck, XCircle, Clock,
  Undo2, Trash2, AlertTriangle, Plus, Copy, Check, Truck,
  MessageCircle, X, Search, ShoppingBag, Package,
  Download, Edit2, BarChart2, AlertCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type DateFilter = "all" | "today" | "yesterday" | "week" | "month";

// ── Status config ─────────────────────────────────────────────────────────────

const SC: Record<OrderStatus, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  pending:   { label: "Pending",   bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  icon: <Clock className="w-3 h-3" /> },
  confirmed: { label: "Confirmed", bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   icon: <CheckCheck className="w-3 h-3" /> },
  delivered: { label: "Delivered", bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  icon: <Truck className="w-3 h-3" /> },
  cancelled: { label: "Cancelled", bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200",    icon: <XCircle className="w-3 h-3" /> },
  returned:  { label: "Returned",  bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: <Undo2 className="w-3 h-3" /> },
};

const TRANS: Record<OrderStatus, { next: OrderStatus; label: string; primary?: boolean; danger?: boolean }[]> = {
  pending:   [{ next: "confirmed", label: "Confirm", primary: true }, { next: "cancelled", label: "Cancel Order", danger: true }],
  confirmed: [{ next: "delivered", label: "Mark Delivered", primary: true }, { next: "pending", label: "Revert to Pending" }, { next: "cancelled", label: "Cancel Order", danger: true }],
  delivered: [{ next: "returned", label: "Mark Returned" }, { next: "confirmed", label: "Revert to Confirmed" }],
  cancelled: [{ next: "pending", label: "Reopen Order", primary: true }],
  returned:  [{ next: "delivered", label: "Revert to Delivered" }, { next: "pending", label: "Reopen as Pending" }],
};

// Stock effect: prev → next
function stockDelta(prev: OrderStatus, next: OrderStatus, qty: number): number {
  const wasDelivered = prev === "delivered";
  const wasReturned  = prev === "returned";
  const nowDelivered = next === "delivered";
  const nowReturned  = next === "returned";
  if (!wasDelivered && nowDelivered) return -qty;  // delivering → deduct
  if (wasDelivered && !nowDelivered) return +qty;  // un-delivering → restore
  if (!wasReturned && nowReturned)   return +qty;  // returning → restore
  if (wasReturned && !nowReturned)   return -qty;  // un-returning → deduct
  return 0;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
}

function Badge({ status }: { status: OrderStatus }) {
  const s = SC[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {s.icon}{s.label}
    </span>
  );
}

function fmtDate(d: unknown) {
  return d instanceof Date
    ? d.toLocaleDateString("en-PK", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "—";
}

function dateRangeFor(f: DateFilter): { start: Date; end: Date } | null {
  if (f === "all") return null;
  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  if (f === "today") return { start: today, end: now };
  if (f === "yesterday") {
    const y = new Date(today); y.setDate(y.getDate() - 1);
    const ye = new Date(today); ye.setMilliseconds(-1);
    return { start: y, end: ye };
  }
  if (f === "week") {
    const s = new Date(today); s.setDate(s.getDate() - 6);
    return { start: s, end: now };
  }
  if (f === "month") {
    const s = new Date(today); s.setDate(s.getDate() - 29);
    return { start: s, end: now };
  }
  return null;
}

function exportCSV(orders: Order[]) {
  const header = ["ID", "Name", "Phone", "City", "Address", "Product", "Qty", "Price", "Total", "Status", "Date", "Note"];
  const rows = orders.map(o => [
    o.id, o.name, o.phone, o.city,
    `"${o.address.replace(/"/g, '""')}"`,
    o.productName, o.quantity, o.price,
    o.price * o.quantity, o.status,
    o.createdAt instanceof Date ? o.createdAt.toISOString() : "",
    o.note ? `"${o.note.replace(/"/g, '""')}"` : "",
  ]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5">
      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />{msg}
    </div>
  );
}

// ── Revenue Chart ─────────────────────────────────────────────────────────────

function RevenueChart({ orders }: { orders: Order[] }) {
  const days = useMemo(() => {
    const result: { label: string; revenue: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const revenue = orders
        .filter(o => (o.status === "confirmed" || o.status === "delivered") &&
          o.createdAt instanceof Date && o.createdAt >= d && o.createdAt < next)
        .reduce((s, o) => s + o.price * o.quantity, 0);
      result.push({
        label: d.toLocaleDateString("en-PK", { weekday: "short" }),
        date: d.toLocaleDateString("en-PK", { day: "numeric", month: "short" }),
        revenue,
      });
    }
    return result;
  }, [orders]);

  const max = Math.max(...days.map(d => d.revenue), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-4 h-4 text-[#C4976A]" />
        <h3 className="font-bold text-gray-900 text-sm">Revenue — Last 7 Days</h3>
        <span className="text-xs text-gray-400 ml-auto">Confirmed + Delivered</span>
      </div>
      <div className="flex items-end gap-2 h-28">
        {days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full rounded-t-lg bg-[#C4976A]/80 hover:bg-[#C4976A] transition-colors cursor-default"
              style={{ height: `${Math.max((d.revenue / max) * 96, d.revenue > 0 ? 8 : 2)}px` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap">
                {d.date}<br />PKR {d.revenue.toLocaleString()}
              </div>
              <div className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-1" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stock Panel ───────────────────────────────────────────────────────────────

function StockPanel({ stock, onSave }: { stock: StockMap; onSave: (id: string, val: number) => Promise<void> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [val, setVal] = useState("");
  const [saving, setSaving] = useState(false);

  const LOW = 5;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-4 h-4 text-[#C4976A]" />
        <h3 className="font-bold text-gray-900 text-sm">Stock</h3>
        <span className="text-xs text-gray-400 ml-auto">Admin only</span>
      </div>
      <div className="space-y-2">
        {allVariants.map(p => {
          const qty = stock[p.id] ?? 0;
          const low = qty <= LOW;
          return (
            <div key={p.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${low ? "bg-red-50" : "bg-gray-50"}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
              </div>
              {editing === p.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={0} value={val}
                    onChange={e => setVal(e.target.value)}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-900"
                    autoFocus
                  />
                  <button
                    disabled={saving}
                    onClick={async () => {
                      setSaving(true);
                      await onSave(p.id, parseInt(val) || 0);
                      setSaving(false); setEditing(null);
                    }}
                    className="text-xs font-bold text-white bg-gray-900 px-3 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                  </button>
                  <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${low ? "text-red-600" : "text-gray-900"}`}>
                    {qty} {low && <span className="text-[10px] text-red-500 font-semibold">LOW</span>}
                  </span>
                  <button
                    onClick={() => { setEditing(p.id); setVal(String(qty)); }}
                    className="text-gray-300 hover:text-gray-600 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function DetailModal({ order, onClose, onStatusUpdate, onOrderUpdate, updating }: {
  order: Order; onClose: () => void;
  onStatusUpdate: (id: string, next: OrderStatus) => Promise<void>;
  onOrderUpdate: (id: string, data: Partial<OrderData>) => Promise<void>;
  updating: boolean;
}) {
  const { copied, copy } = useCopy();
  const trans = TRANS[order.status];
  const total = order.price * order.quantity;
  const waNum = order.phone.replace(/^0/, "92");
  const waMsg = [
    `*Order Confirmation* 📦`, `━━━━━━━━━━━━━`,
    `👤 *Name:* ${order.name}`, `📱 *Phone:* ${order.phone}`,
    `📦 *Product:* ${order.productName}`, `🔢 *Qty:* ${order.quantity}`,
    `💰 *Amount:* PKR ${total.toLocaleString()}`,
    `📍 *Address:* ${order.address}`, `🏙️ *City:* ${order.city}`,
    order.note ? `📝 *Note:* ${order.note}` : null,
    `━━━━━━━━━━━━━`, `✅ COD — Cash on Delivery`,
  ].filter(Boolean).join("\n");

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: order.name, phone: order.phone, address: order.address, city: order.city, quantity: String(order.quantity), note: order.note ?? "" });
  const [saving, setSaving] = useState(false);

  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[95vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-base flex-shrink-0">
              {order.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900">{order.name}</p>
              <p className="text-xs text-gray-400">{fmtDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge status={order.status} />
            <button
              onClick={() => setEditing(e => !e)}
              className={`p-1.5 rounded-lg transition-colors ${editing ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-400"}`}
              title="Edit order"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Quantity</label>
                  <input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                <textarea rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={`${inp} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Note</label>
                <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className={inp} placeholder="Optional note…" />
              </div>
            </div>
          ) : (
            <>
              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Customer</p>
                <div className="space-y-2.5">
                  {([["Name", order.name, "nm"], ["Phone", order.phone, "ph"], ["City", order.city, "ct"]] as [string, string, string][]).map(([label, value, key]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{value}</span>
                        <button onClick={() => copy(value, key)} className="text-gray-300 hover:text-gray-600 transition-colors">
                          {copied === key ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-gray-400 flex-shrink-0">Address</span>
                    <div className="flex items-start gap-2 text-right">
                      <span className="text-sm font-semibold text-gray-900">{order.address}</span>
                      <button onClick={() => copy(order.address, "ad")} className="text-gray-300 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5">
                        {copied === "ad" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              <div className="border-t border-gray-100" />
              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Order</p>
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-gray-400">Product</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">{order.productName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Quantity</span>
                    <span className="text-sm font-semibold text-gray-900">{order.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Unit Price</span>
                    <span className="text-sm text-gray-600">PKR {order.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-900">Total (COD)</span>
                    <span className="text-lg font-bold text-gray-900">PKR {total.toLocaleString()}</span>
                  </div>
                </div>
              </section>
              {order.note && (
                <>
                  <div className="border-t border-gray-100" />
                  <section>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Note</p>
                    <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">{order.note}</p>
                  </section>
                </>
              )}
            </>
          )}
        </div>

        <div className="px-6 pt-4 pb-6 border-t border-gray-100 space-y-2.5 flex-shrink-0">
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  await onOrderUpdate(order.id, {
                    name: form.name.trim(), phone: form.phone.trim(),
                    address: form.address.trim(), city: form.city.trim(),
                    quantity: parseInt(form.quantity) || 1,
                    ...(form.note.trim() ? { note: form.note.trim() } : { note: undefined }),
                  });
                  setSaving(false); setEditing(false);
                }}
                className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => copy(waMsg, "wa")}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] hover:bg-[#1fba5b] text-white text-sm font-bold transition-colors">
                  {copied === "wa" ? <><Check className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy Message</>}
                </button>
                <Link href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#25D366] text-[#25D366] text-sm font-bold hover:bg-green-50 transition-colors">
                  <MessageCircle className="w-4 h-4" />Open Chat
                </Link>
              </div>
              {trans.length > 0 && (
                <div className="flex flex-col gap-2">
                  {trans.filter(t => !t.danger).length > 0 && (
                    <div className={`grid gap-2 ${trans.filter(t => !t.danger).length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                      {trans.filter(t => !t.danger).map(({ next, label, primary }) => (
                        <button key={next} disabled={updating}
                          onClick={async () => { await onStatusUpdate(order.id, next); onClose(); }}
                          className={`py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                            primary ? "bg-gray-900 text-white hover:bg-gray-800" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}>
                          {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : SC[next].icon}{label}
                        </button>
                      ))}
                    </div>
                  )}
                  {trans.filter(t => t.danger).map(({ next, label }) => (
                    <button key={next} disabled={updating}
                      onClick={async () => { await onStatusUpdate(order.id, next); onClose(); }}
                      className="w-full py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50">
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}{label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Manual Order Modal ────────────────────────────────────────────────────────

function ManualModal({ onClose, onCreated }: { onClose: () => void; onCreated: (o: Order) => void }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", productId: "", quantity: "1", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const product = allVariants.find(p => p.id === form.productId);
  const total = product ? product.price * (parseInt(form.quantity) || 1) : 0;
  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [f]: e.target.value }));
  const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setError("Please fill all required fields"); return;
    }
    setSubmitting(true); setError("");
    try {
      const data: OrderData = {
        name: form.name.trim(), phone: form.phone.trim(),
        address: form.address.trim(), city: form.city.trim(),
        productId: product.id, productName: product.name,
        price: product.price, quantity: parseInt(form.quantity) || 1,
        ...(form.note.trim() && { note: form.note.trim() }),
      };
      const id = await createOrder(data);
      onCreated({ ...data, id, status: "pending", createdAt: new Date() } as Order);
      onClose();
    } catch { setError("Failed. Please try again."); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">New Manual Order</h2>
            <p className="text-xs text-gray-400 mt-0.5">WhatsApp / phone order</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Product *</label>
            <select value={form.productId} onChange={set("productId")} className={inp}>
              <option value="">Select product…</option>
              {allVariants.map(p => <option key={p.id} value={p.id}>{p.name} — PKR {p.price.toLocaleString()}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Name *</label><input value={form.name} onChange={set("name")} placeholder="Ali Hassan" className={inp} /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone *</label><input value={form.phone} onChange={set("phone")} placeholder="03001234567" className={inp} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">City *</label><input value={form.city} onChange={set("city")} placeholder="Karachi" className={inp} /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Quantity</label><input type="number" min="1" value={form.quantity} onChange={set("quantity")} className={inp} /></div>
          </div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Address *</label><textarea value={form.address} onChange={set("address")} placeholder="Full delivery address" rows={2} className={`${inp} resize-none`} /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Note (optional)</label><input value={form.note} onChange={set("note")} placeholder="Special instructions…" className={inp} /></div>
          {product && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total (COD)</span>
              <span className="text-base font-bold text-gray-900">PKR {total.toLocaleString()}</span>
            </div>
          )}
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2.5 rounded-xl">{error}</p>}
          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {submitting ? "Creating…" : "Create Order"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────

function DeleteModal({ label, onConfirm, onCancel, loading }: {
  label: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="font-bold text-gray-900 mb-1.5">Delete Order?</h3>
        <p className="text-sm text-gray-500 mb-6">{label}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [authChecked, setAuthChecked]   = useState(false);
  const [orders, setOrders]             = useState<Order[]>([]);
  const [stock, setStockState]          = useState<StockMap>({});
  const [loading, setLoading]           = useState(true);
  const [updatingId, setUpdatingId]     = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFilter, setDateFilter]     = useState<DateFilter>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [toast, setToast]               = useState<string | null>(null);

  const [detailOrder,  setDetailOrder]  = useState<Order | null>(null);
  const [showManual,   setShowManual]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ ids: string[]; label: string } | null>(null);

  // Auth check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { if (!u) router.replace("/admin"); else setAuthChecked(true); });
    return () => unsub();
  }, [router]);

  // Real-time orders
  const fetchOrders = useCallback(() => {
    setLoading(true);
    const unsub = subscribeToOrders(
      (orders) => { setOrders(orders); setLoading(false); },
      (err) => { console.error(err); setLoading(false); }
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    const unsub = fetchOrders();
    return () => unsub();
  }, [authChecked, fetchOrders]);

  // Real-time stock
  useEffect(() => {
    if (!authChecked) return;
    const unsub = subscribeToStock(setStockState);
    return () => unsub();
  }, [authChecked]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return {
      total:     orders.length,
      today:     orders.filter(o => o.createdAt instanceof Date && o.createdAt >= today).length,
      pending:   orders.filter(o => o.status === "pending").length,
      confirmed: orders.filter(o => o.status === "confirmed").length,
      delivered: orders.filter(o => o.status === "delivered").length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
      returned:  orders.filter(o => o.status === "returned").length,
      revenue:   orders.filter(o => o.status === "confirmed" || o.status === "delivered")
                       .reduce((s, o) => s + o.price * o.quantity, 0),
    };
  }, [orders]);

  // Low stock alert
  const lowStockProducts = useMemo(() =>
    allVariants.filter(p => stock[p.id] !== undefined && stock[p.id] <= 5),
  [stock]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);

    // Date filter
    const range = dateRangeFor(dateFilter);
    if (range) {
      list = list.filter(o => o.createdAt instanceof Date && o.createdAt >= range.start && o.createdAt <= range.end);
    }

    // Product filter
    if (productFilter !== "all") {
      list = list.filter(o => o.productId === productFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.name.toLowerCase().includes(q) || o.phone.includes(q) ||
        o.city.toLowerCase().includes(q) || o.productName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, dateFilter, productFilter, search]);

  const handleStatusUpdate = async (orderId: string, next: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, next);
      // Stock adjustment
      const delta = stockDelta(order.status, next, order.quantity);
      if (delta !== 0) {
        await adjustStock(order.productId, delta);
      }
      setToast(`Marked as ${SC[next].label}`);
      if (detailOrder?.id === orderId) setDetailOrder(prev => prev ? { ...prev, status: next } : null);
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const handleOrderUpdate = async (orderId: string, data: Partial<OrderData>) => {
    await updateOrder(orderId, data);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
    if (detailOrder?.id === orderId) setDetailOrder(prev => prev ? { ...prev, ...data } : null);
    setToast("Order updated");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const ids = deleteTarget.ids;
    setDeletingId(ids[0]);
    try {
      await Promise.all(ids.map(id => deleteOrder(id)));
      setSelected(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; });
      setToast(`${ids.length} order${ids.length > 1 ? "s" : ""} deleted`);
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); setDeleteTarget(null); }
  };

  const handleBulkStatus = async (next: OrderStatus) => {
    const ids = Array.from(selected);
    await Promise.all(ids.map(async id => {
      const order = orders.find(o => o.id === id);
      if (!order) return;
      await updateOrderStatus(id, next);
      const delta = stockDelta(order.status, next, order.quantity);
      if (delta !== 0) await adjustStock(order.productId, delta);
    }));
    setSelected(new Set());
    setToast(`${ids.length} orders marked ${SC[next].label}`);
  };

  const toggleSelect  = (id: string) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const allSelected   = filtered.length > 0 && selected.size === filtered.length;
  const someSelected  = selected.size > 0 && !allSelected;
  const toggleAll     = () => allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(o => o.id)));

  const STATUS_TABS: { key: OrderStatus | "all"; label: string; count: number }[] = [
    { key: "all",       label: "All",       count: stats.total },
    { key: "pending",   label: "Pending",   count: stats.pending },
    { key: "confirmed", label: "Confirmed", count: stats.confirmed },
    { key: "delivered", label: "Delivered", count: stats.delivered },
    { key: "cancelled", label: "Cancelled", count: stats.cancelled },
    { key: "returned",  label: "Returned",  count: stats.returned },
  ];

  const DATE_TABS: { key: DateFilter; label: string }[] = [
    { key: "all", label: "All time" },
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "week", label: "Last 7 days" },
    { key: "month", label: "Last 30 days" },
  ];

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {detailOrder && (
        <DetailModal
          order={detailOrder} onClose={() => setDetailOrder(null)}
          onStatusUpdate={handleStatusUpdate}
          onOrderUpdate={handleOrderUpdate}
          updating={updatingId === detailOrder.id}
        />
      )}
      {showManual && (
        <ManualModal onClose={() => setShowManual(false)}
          onCreated={o => { setToast("Order created"); }} />
      )}
      {deleteTarget && (
        <DeleteModal label={deleteTarget.label} onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)} loading={deletingId !== null} />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#C4976A]" strokeWidth={1.5} />
            <span className="font-bold text-gray-900 text-sm tracking-tight">WatchesByFahad</span>
            <span className="text-gray-300 text-sm hidden sm:inline">/</span>
            <span className="text-gray-500 text-sm hidden sm:inline">Admin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowManual(true)}
              className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-gray-800 transition-colors">
              <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Add Order</span>
            </button>
            <button onClick={() => exportCSV(filtered)} title="Export CSV"
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={async () => { await signOut(auth); router.push("/admin"); }} title="Logout"
              className="p-2 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Pending alert */}
        {stats.pending > 0 && (
          <div className="bg-amber-500 text-white rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-sm">{stats.pending} order{stats.pending > 1 ? "s" : ""} waiting for confirmation</p>
                <p className="text-xs text-amber-100 mt-0.5">Review and confirm to start delivery</p>
              </div>
            </div>
            <button
              onClick={() => { setStatusFilter("pending"); setSearch(""); setSelected(new Set()); }}
              className="flex-shrink-0 bg-white text-amber-600 text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors">
              Review
            </button>
          </div>
        )}

        {/* Low stock alert */}
        {lowStockProducts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm text-red-700">Low stock: {lowStockProducts.map(p => `${p.name} (${stock[p.id] ?? 0})`).join(", ")}</p>
              <p className="text-xs text-red-500 mt-0.5">Restock soon to avoid missed orders</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Revenue",   value: `PKR ${stats.revenue >= 1000 ? (stats.revenue/1000).toFixed(0)+"k" : stats.revenue.toLocaleString()}`, sub: "Confirmed + Delivered", color: "text-[#C4976A]", icon: "💰" },
            { label: "Today",     value: stats.today,     sub: "New orders",   color: "text-blue-600",  icon: "📅" },
            { label: "Pending",   value: stats.pending,   sub: "Need action",  color: "text-amber-600", icon: "⏳" },
            { label: "Confirmed", value: stats.confirmed, sub: "In progress",  color: "text-blue-600",  icon: "✅" },
            { label: "Delivered", value: stats.delivered, sub: "Completed",    color: "text-green-600", icon: "🚚" },
            { label: "Cancelled", value: stats.cancelled, sub: "Lost orders",  color: "text-red-500",   icon: "❌" },
          ].map(({ label, value, sub, color, icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <span className="text-lg">{icon}</span>
              <p className={`text-xl font-bold ${color} mt-2`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Chart + Stock side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RevenueChart orders={orders} />
          <StockPanel stock={stock} onSave={async (id, val) => { await setStock(id, val); setToast("Stock updated"); }} />
        </div>

        {/* Orders card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-bold text-gray-900">Orders</h2>
                <p className="text-xs text-gray-400 mt-0.5">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Product filter */}
                <select
                  value={productFilter}
                  onChange={e => { setProductFilter(e.target.value); setSelected(new Set()); }}
                  className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-600 font-medium"
                >
                  <option value="all">All products</option>
                  {allVariants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Name, phone, city…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50 focus:bg-white transition-colors w-44"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Date filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {DATE_TABS.map(({ key, label }) => (
                <button key={key}
                  onClick={() => { setDateFilter(key); setSelected(new Set()); }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    dateFilter === key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {STATUS_TABS.map(({ key, label, count }) => (
                <button key={key}
                  onClick={() => { setStatusFilter(key); setSelected(new Set()); }}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    statusFilter === key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    statusFilter === key ? "bg-white/20 text-white" : "bg-white text-gray-500"
                  }`}>{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bulk bar */}
          {selected.size > 0 && (
            <div className="px-5 py-3 bg-gray-900 flex flex-wrap items-center gap-2.5">
              <span className="text-white text-sm font-semibold">{selected.size} selected</span>
              <div className="flex flex-wrap gap-2 ml-auto">
                {[
                  { label: "Confirm All",    fn: () => handleBulkStatus("confirmed"), cls: "bg-blue-500 hover:bg-blue-400" },
                  { label: "Mark Delivered", fn: () => handleBulkStatus("delivered"), cls: "bg-green-500 hover:bg-green-400" },
                  { label: "Cancel All",     fn: () => handleBulkStatus("cancelled"), cls: "bg-white/10 hover:bg-white/20" },
                ].map(({ label, fn, cls }) => (
                  <button key={label} onClick={fn} className={`text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-colors ${cls}`}>{label}</button>
                ))}
                <button
                  onClick={() => setDeleteTarget({ ids: Array.from(selected), label: `Permanently delete ${selected.size} order${selected.size > 1 ? "s" : ""}?` })}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg text-white bg-red-500 hover:bg-red-400 transition-colors">
                  Delete
                </button>
                <button onClick={() => setSelected(new Set())} title="Clear selection"
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-28">
              <Loader2 className="w-7 h-7 animate-spin text-gray-200" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-300">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium text-gray-400">No orders found</p>
              {(search || dateFilter !== "all" || productFilter !== "all") && (
                <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 w-10">
                        <button onClick={toggleAll} className="flex items-center justify-center">
                          <span className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            allSelected ? "bg-gray-900 border-gray-900" : someSelected ? "bg-gray-400 border-gray-400" : "border-gray-300"
                          }`}>
                            {(allSelected || someSelected) && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                        </button>
                      </th>
                      {["Customer", "Product", "Amount", "City", "Status", "Date", "Actions"].map(h => (
                        <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map(order => {
                      const trans      = TRANS[order.status];
                      const isUpdating = updatingId === order.id;
                      const isSelected = selected.has(order.id);
                      return (
                        <tr key={order.id} className={`transition-colors ${isSelected ? "bg-blue-50/50" : "hover:bg-gray-50/60"}`}>
                          <td className="px-5 py-3.5">
                            <button onClick={() => toggleSelect(order.id)} className="flex items-center justify-center">
                              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected ? "bg-gray-900 border-gray-900" : "border-gray-300"
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                              </span>
                            </button>
                          </td>
                          <td className="px-4 py-3.5">
                            <button onClick={() => setDetailOrder(order)} className="text-left group">
                              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                                {order.name}
                                {order.note && <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">NOTE</span>}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">{order.phone}</p>
                            </button>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-gray-700 max-w-[150px] truncate text-sm">{order.productName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Qty: {order.quantity}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-gray-900">PKR {(order.price * order.quantity).toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-500">{order.city}</td>
                          <td className="px-4 py-3.5"><Badge status={order.status} /></td>
                          <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{fmtDate(order.createdAt)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {trans.slice(0, 1).map(({ next, label, primary }) => (
                                <button key={next} onClick={() => handleStatusUpdate(order.id, next)} disabled={isUpdating}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap ${
                                    primary ? "bg-gray-900 text-white hover:bg-gray-800" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                                  }`}>
                                  {isUpdating ? <Loader2 className="w-3 h-3 animate-spin inline" /> : label}
                                </button>
                              ))}
                              <button onClick={() => setDetailOrder(order)}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                                ···
                              </button>
                              <button onClick={() => setDeleteTarget({ ids: [order.id], label: `Delete order from ${order.name}?` })}
                                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <button onClick={toggleAll} className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      allSelected ? "bg-gray-900 border-gray-900" : someSelected ? "bg-gray-400 border-gray-400" : "border-gray-300"
                    }`}>
                      {(allSelected || someSelected) && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                  <span className="text-xs text-gray-400">{filtered.length} orders</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {filtered.map(order => {
                    const trans      = TRANS[order.status];
                    const isSelected = selected.has(order.id);
                    const isUpdating = updatingId === order.id;
                    return (
                      <div key={order.id} className={`p-4 transition-colors ${isSelected ? "bg-blue-50/40" : ""}`}>
                        <div className="flex items-start gap-3">
                          <button onClick={() => toggleSelect(order.id)} className="mt-1 flex-shrink-0">
                            <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected ? "bg-gray-900 border-gray-900" : "border-gray-300"
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                          </button>
                          <div className="flex-1 min-w-0" onClick={() => setDetailOrder(order)}>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-gray-900">{order.name}</span>
                                  {order.note && <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">NOTE</span>}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{order.phone} · {order.city}</p>
                              </div>
                              <Badge status={order.status} />
                            </div>
                            <p className="text-sm text-gray-600 truncate">{order.productName} × {order.quantity}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="font-bold text-gray-900 text-sm">PKR {(order.price * order.quantity).toLocaleString()}</span>
                              <span className="text-xs text-gray-300">{fmtDate(order.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 ml-7">
                          {trans.slice(0, 1).map(({ next, label, primary }) => (
                            <button key={next} onClick={() => handleStatusUpdate(order.id, next)} disabled={isUpdating}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${
                                primary ? "bg-gray-900 text-white hover:bg-gray-800" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}>
                              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin inline" /> : label}
                            </button>
                          ))}
                          <button onClick={() => setDetailOrder(order)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                            Details
                          </button>
                          <button onClick={() => setDeleteTarget({ ids: [order.id], label: `Delete order from ${order.name}?` })}
                            className="p-2 rounded-xl border border-gray-200 text-gray-300 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center pb-2">
          {stats.total} total orders · PKR {stats.revenue.toLocaleString()} revenue
        </p>
      </main>
    </div>
  );
}
