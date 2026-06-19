"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  subscribeToOrders, updateOrderStatus, updateOrder, deleteOrder, createOrder,
  updatePublicStats, Order, OrderStatus, OrderData,
} from "@/lib/orders";
import { subscribeToStock, setStock, adjustStock, StockMap } from "@/lib/stock";
import { CATALOG } from "@/data/products";
import {
  subscribeToExpenses, addExpense, deleteExpense,
  Expense, ExpenseData, ExpenseType,
  EXPENSE_LABELS, EXPENSE_IS_INCOME, EXPENSE_COLORS,
} from "@/lib/finance";
import { postexBook } from "@/lib/postex";
import {
  LayoutDashboard, ShoppingCart, Truck, Package, BarChart2,
  LogOut, Loader2, CheckCheck, Clock, Trash2,
  AlertTriangle, Copy, Check, MessageCircle, X, Search,
  Download, Edit2, AlertCircle, RefreshCw, Phone, Zap,
  MapPin, FileText, TrendingUp, Menu, ChevronRight, Bell,
  Plus, Volume2, VolumeX, XOctagon, CheckCircle2,
  DollarSign, TrendingDown, ArrowUpRight, ArrowDownRight, RotateCcw, Calendar,
} from "lucide-react";

// ─── Catalog flat list ────────────────────────────────────────────────────────
const allVariants = CATALOG.map(p => ({
  id:    p.id,
  name:  `${p.name} | ${p.seriesName}`,
  price: p.price,
}));

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "dashboard" | "orders" | "logistics" | "inventory" | "analytics" | "finance";
type DateFilter = "all" | "today" | "yesterday" | "week" | "month" | "custom";

// ─── Status config ────────────────────────────────────────────────────────────
const SC: Record<OrderStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  pending:           { label: "Pending",            bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-400"  },
  confirmed:         { label: "Confirmed",          bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500"   },
  dispatched:        { label: "Dispatched",         bg: "bg-indigo-50",  text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
  in_transit:        { label: "In Transit",         bg: "bg-sky-50",     text: "text-sky-700",    border: "border-sky-200",    dot: "bg-sky-500"    },
  delivered:         { label: "Delivered",          bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500"  },
  failed_delivery:   { label: "Failed Delivery",    bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  return_in_transit: { label: "Return in Transit",  bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-200",   dot: "bg-rose-500"   },
  returned:          { label: "Return Received",    bg: "bg-purple-50",  text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
  cancelled:         { label: "Cancelled",          bg: "bg-red-50",     text: "text-red-600",    border: "border-red-200",    dot: "bg-red-500"    },
};

const TRANS: Record<OrderStatus, { next: OrderStatus; label: string; primary?: boolean; danger?: boolean }[]> = {
  pending:           [{ next: "confirmed",          label: "Confirm Order",      primary: true }, { next: "cancelled",          label: "Cancel",            danger: true }],
  confirmed:         [{ next: "dispatched",         label: "Mark Dispatched",    primary: true }, { next: "cancelled",          label: "Cancel",            danger: true }, { next: "pending", label: "Revert" }],
  dispatched:        [{ next: "in_transit",         label: "In Transit",         primary: true }, { next: "confirmed",          label: "Revert" }],
  in_transit:        [{ next: "delivered",          label: "Mark Delivered",     primary: true }, { next: "failed_delivery",    label: "Failed Delivery",   danger: true }],
  delivered:         [{ next: "return_in_transit",  label: "Return in Transit",  danger: true  }, { next: "in_transit",         label: "Revert" }],
  failed_delivery:   [{ next: "in_transit",         label: "Retry Delivery",     primary: true }, { next: "return_in_transit",  label: "Return to Origin",  danger: true }],
  return_in_transit: [{ next: "returned",           label: "Return Received",    primary: true }, { next: "in_transit",         label: "Retry Delivery" }],
  returned:          [{ next: "pending",            label: "Reopen Order",       primary: true }],
  cancelled:         [{ next: "pending",            label: "Reopen Order",       primary: true }],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function stockDelta(prev: OrderStatus, next: OrderStatus, qty: number): number {
  if (prev !== "delivered"         && next === "delivered")         return -qty;
  if (prev === "delivered"         && next !== "delivered")         return +qty;
  if (prev !== "returned"          && next === "returned")          return +qty;
  if (prev === "returned"          && next !== "returned")          return -qty;
  if (prev !== "return_in_transit" && next === "return_in_transit") return +qty;
  if (prev === "return_in_transit" && next !== "return_in_transit") return -qty;
  return 0;
}

function fmtDate(d: unknown) {
  let date: Date | null = null;
  if (d instanceof Date) date = d;
  else if (d && typeof (d as { toDate?: unknown }).toDate === "function") {
    date = (d as { toDate: () => Date }).toDate();
  }
  if (!date) return "—";
  return date.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function fmtDay(d: Date) {
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

function orderAgeHours(o: Order) {
  if (!(o.createdAt instanceof Date)) return 0;
  return (Date.now() - o.createdAt.getTime()) / 3600000;
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
  if (f === "week")  { const s = new Date(today); s.setDate(s.getDate() - 6);  return { start: s, end: now }; }
  if (f === "month") { const s = new Date(today); s.setDate(s.getDate() - 29); return { start: s, end: now }; }
  return null;
}

function exportCSV(orders: Order[]) {
  const header = ["ID","Name","Phone","City","Address","Product","Qty","Price","Total","Status","Courier","CN","Date","Note"];
  const rows = orders.map(o => [
    o.id, o.name, o.phone, o.city,
    o.address ? `"${o.address.replace(/"/g,'""')}"` : "",
    o.productName, o.quantity, o.price, o.price * o.quantity,
    o.status, o.courierName ?? "", o.trackingNumber ?? "",
    o.createdAt instanceof Date ? o.createdAt.toISOString() : "",
    o.note ? `"${o.note.replace(/"/g,'""')}"` : "",
  ]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

function buildWAMsg(order: Order): string {
  const total = order.price * order.quantity;
  const cn = order.trackingNumber ?? "";
  return encodeURIComponent([
    `Your order has been dispatched! 🚚`,
    `━━━━━━━━━━━━━`,
    `👤 *Name:* ${order.name}`,
    `📦 *Product:* ${order.productName}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()}`,
    "",
    cn ? `📋 *Tracking Number:* ${cn}` : "",
    "",
    `📞 For any queries, message us here`,
    `━━━━━━━━━━━━━`,
    `_ZARAAR — Your Trust, Our Pride_`,
  ].filter(Boolean).join("\n"));
}

function waHref(order: Order) {
  return `https://wa.me/92${order.phone.replace(/^0/,"")}?text=${buildWAMsg(order)}`;
}

// ─── Status-specific WA message builders ─────────────────────────────────────
function waMsg_confirmed(order: Order): string {
  const total = order.price * order.quantity;
  return [
    `Hi ${order.name}! 👋`,
    ``,
    `Your order with *ZARAAR* has been confirmed ✅`,
    ``,
    `📦 *Product:* ${order.productName}`,
    `🔢 *Quantity:* ${order.quantity}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()}`,
    `📍 *Delivery to:* ${order.city}`,
    ``,
    `We will dispatch your order soon and share the tracking number with you.`,
    ``,
    `Thank you for shopping with us! 🙏`,
    `— ZARAAR`,
  ].join("\n");
}

function waMsg_dispatched(order: Order): string {
  const total = order.price * order.quantity;
  const cn = order.trackingNumber ?? "";
  return [
    `Hi ${order.name}! 🚚`,
    ``,
    `Your *ZARAAR* order has been dispatched!`,
    ``,
    `📦 *Product:* ${order.productName}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()}`,
    cn ? `📋 *Tracking Number:* ${cn}` : "",
    ``,
    `Please keep the COD amount ready upon delivery.`,
    ``,
    `📞 Any questions? Message us here!`,
    `— ZARAAR`,
  ].filter(Boolean).join("\n");
}

function waMsg_outForDelivery(order: Order): string {
  const total = order.price * order.quantity;
  const cn = order.trackingNumber ?? "";
  return [
    `Hi ${order.name}! 📦`,
    ``,
    `Great news — your *ZARAAR* order is *out for delivery today!*`,
    ``,
    `📦 *Product:* ${order.productName}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()} _(please keep cash ready)_`,
    cn ? `📋 *Tracking:* ${cn}` : "",
    ``,
    `Please be available to receive your order.`,
    ``,
    `Thank you! 🙏`,
    `— ZARAAR`,
  ].filter(Boolean).join("\n");
}

function waMsg_delivered(order: Order): string {
  return [
    `Hi ${order.name}! 🎉`,
    ``,
    `Your *ZARAAR* order has been delivered — we hope you love it! ❤️`,
    ``,
    `📦 *Product:* ${order.productName}`,
    ``,
    `If you're happy with your purchase, please share it with your friends and family! 😊`,
    ``,
    `Thank you for shopping with us!`,
    `— ZARAAR`,
  ].join("\n");
}

function waMsg_failedDelivery(order: Order): string {
  const total = order.price * order.quantity;
  return [
    `Hi ${order.name},`,
    ``,
    `We attempted to deliver your order but were unable to reach you. 😔`,
    ``,
    `📦 *Product:* ${order.productName}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()}`,
    ``,
    `Please reply here or call us to reschedule your delivery at your convenience.`,
    ``,
    `— ZARAAR`,
  ].join("\n");
}

function waMsg_returned(order: Order): string {
  const total = order.price * order.quantity;
  return [
    `Hi ${order.name},`,
    ``,
    `Your order has been returned to us as we were unable to complete the delivery.`,
    ``,
    `📦 *Product:* ${order.productName}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()}`,
    ``,
    `If you'd like to re-order or have any questions, please message us here.`,
    ``,
    `— ZARAAR`,
  ].join("\n");
}

function waMsg_returnInTransit(order: Order): string {
  const total = order.price * order.quantity;
  return [
    `Hi ${order.name},`,
    ``,
    `Your *ZARAAR* order is currently on its way back to us. 📦`,
    ``,
    `📦 *Product:* ${order.productName}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()}`,
    ``,
    `If you'd like to reschedule delivery or have any questions, please reply here.`,
    ``,
    `— ZARAAR`,
  ].join("\n");
}

// Returns contextually relevant WA messages for the current order status
function getWAMsgs(order: Order): { key: string; label: string; text: string }[] {
  const map: Record<OrderStatus, { key: string; label: string; text: string }[]> = {
    pending:         [{ key:"confirm",         label:"✅ Order Confirmed",        text: waMsg_confirmed(order) }],
    confirmed:       [{ key:"confirm",         label:"✅ Order Confirmed",        text: waMsg_confirmed(order) },
                     { key:"dispatch",         label:"🚚 Order Dispatched",       text: waMsg_dispatched(order) }],
    dispatched:      [{ key:"dispatch",        label:"🚚 Order Dispatched",       text: waMsg_dispatched(order) },
                     { key:"outForDelivery",   label:"📦 Out for Delivery",       text: waMsg_outForDelivery(order) }],
    in_transit:      [{ key:"outForDelivery",  label:"📦 Out for Delivery",       text: waMsg_outForDelivery(order) },
                     { key:"dispatch",         label:"🚚 Order Dispatched",       text: waMsg_dispatched(order) }],
    delivered:         [{ key:"delivered",         label:"🎉 Thank You / Delivered",  text: waMsg_delivered(order) }],
    failed_delivery:   [{ key:"failed",            label:"😔 Failed Delivery",        text: waMsg_failedDelivery(order) }],
    return_in_transit: [{ key:"returnInTransit",   label:"📦 Return in Transit",      text: waMsg_returnInTransit(order) }],
    returned:          [{ key:"returned",          label:"📦 Return Received",        text: waMsg_returned(order) }],
    cancelled:         [],
  };
  return map[order.status] ?? [];
}

// ─── useCopy ──────────────────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
}

// ─── Alert sound ──────────────────────────────────────────────────────────────
function playNewOrderSound() {
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

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5">
      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />{msg}
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, size = "md" }: { status: OrderStatus; size?: "sm" | "md" }) {
  const s = SC[status]; if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${s.bg} ${s.text} ${s.border} ${size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, accent }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; accent?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 ${accent ? "border-[#C4976A]/40 ring-1 ring-[#C4976A]/20" : "border-gray-100"}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <span className={`p-2 rounded-xl ${accent ? "bg-[#C4976A]/10 text-[#C4976A]" : "bg-gray-100 text-gray-500"}`}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── RevenueChart ─────────────────────────────────────────────────────────────
function RevenueChart({ orders }: { orders: Order[] }) {
  const days = useMemo(() => {
    const result: { label: string; date: string; revenue: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const active: OrderStatus[] = ["confirmed","dispatched","in_transit","delivered"];
      const dayOrders = orders.filter(o =>
        active.includes(o.status) && o.createdAt instanceof Date && o.createdAt >= d && o.createdAt < next
      );
      result.push({ label: d.toLocaleDateString("en-PK",{weekday:"short"}), date: fmtDay(d),
        revenue: dayOrders.reduce((s,o) => s + o.price * o.quantity, 0), count: dayOrders.length });
    }
    return result;
  }, [orders]);
  const max = Math.max(...days.map(d => d.revenue), 1);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Revenue — Last 7 Days</h3>
          <p className="text-xs text-gray-400 mt-0.5">Active orders only</p>
        </div>
        <BarChart2 className="w-4 h-4 text-[#C4976A]" />
      </div>
      <div className="flex items-end gap-2 h-28">
        {days.map((d,i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full rounded-t-lg bg-[#C4976A]/70 hover:bg-[#C4976A] transition-colors"
              style={{ height: `${Math.max((d.revenue/max)*96, d.revenue > 0 ? 6 : 2)}px` }}
            />
            {d.revenue > 0 && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 pointer-events-none">
                <div className="bg-gray-900 text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap text-center shadow-xl">
                  {d.date}<br/>PKR {d.revenue.toLocaleString()}<br/>{d.count} order{d.count!==1?"s":""}
                </div>
              </div>
            )}
            <span className="text-[10px] text-gray-400 font-medium">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DashboardPage ────────────────────────────────────────────────────────────
function DashboardPage({ orders, onOpenOrder }: {
  orders: Order[]; onOpenOrder: (o: Order) => void;
}) {
  const pending     = orders.filter(o => o.status === "pending");
  const today       = new Date(); today.setHours(0,0,0,0);
  const todayOrders = orders.filter(o => o.createdAt instanceof Date && o.createdAt >= today);
  const weekStart   = new Date(today); weekStart.setDate(weekStart.getDate() - 6);
  const weekRevenue = orders
    .filter(o => ["confirmed","dispatched","in_transit","delivered"].includes(o.status) && o.createdAt instanceof Date && o.createdAt >= weekStart)
    .reduce((s,o) => s + o.price * o.quantity, 0);
  const delivered     = orders.filter(o => o.status === "delivered").length;
  const active        = orders.filter(o => !["cancelled","returned"].includes(o.status)).length;
  const deliveryRate  = active > 0 ? Math.round((delivered/active)*100) : 0;
  const urgentPending = pending.filter(o => orderAgeHours(o) > 2)
    .sort((a,b) => (a.createdAt instanceof Date ? a.createdAt.getTime() : 0) - (b.createdAt instanceof Date ? b.createdAt.getTime() : 0));
  const pipeline: OrderStatus[] = ["pending","confirmed","dispatched","in_transit","delivered","failed_delivery","return_in_transit","returned"];

  return (
    <div className="p-5 space-y-5 max-w-7xl mx-auto">
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0"><Bell className="w-4 h-4 text-amber-600" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800">{pending.length} order{pending.length!==1?"s":""} waiting for action</p>
            <p className="text-xs text-amber-600 mt-0.5">{urgentPending.length > 0 ? `${urgentPending.length} older than 2 hours` : "All within 2 hours"}</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Pending Action" value={String(pending.length)}
          sub={urgentPending.length > 0 ? `${urgentPending.length} urgent` : "All recent"}
          icon={<Clock className="w-4 h-4" />} accent={pending.length > 0} />
        <KpiCard label="Today's Orders" value={String(todayOrders.length)}
          sub={`PKR ${todayOrders.reduce((s,o) => s+o.price*o.quantity,0).toLocaleString()}`}
          icon={<ShoppingCart className="w-4 h-4" />} />
        <KpiCard label="Week Revenue"
          value={`PKR ${weekRevenue >= 1000 ? (weekRevenue/1000).toFixed(1)+"k" : weekRevenue.toLocaleString()}`}
          sub="Active orders" icon={<TrendingUp className="w-4 h-4" />} />
        <KpiCard label="Delivery Rate" value={`${deliveryRate}%`}
          sub={`${delivered} of ${active} active`} icon={<CheckCheck className="w-4 h-4" />} />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Order Pipeline</h3>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {pipeline.map((s,i) => (
            <div key={s} className="flex items-center gap-1.5 flex-shrink-0">
              <div className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[80px] ${SC[s].bg}`}>
                <span className={`text-xl font-extrabold ${SC[s].text}`}>{orders.filter(o=>o.status===s).length}</span>
                <span className={`text-[10px] font-semibold ${SC[s].text} opacity-80 mt-0.5 text-center leading-tight`}>{SC[s].label}</span>
              </div>
              {i < pipeline.length-1 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <RevenueChart orders={orders} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm">Pending Orders</h3>
            <span className="text-xs text-gray-400">{pending.length} total</span>
          </div>
          {pending.length === 0 ? (
            <div className="text-center py-8">
              <CheckCheck className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.slice(0,6).map(o => {
                const age = orderAgeHours(o); const urgent = age > 2;
                return (
                  <div key={o.id} onClick={() => onOpenOrder(o)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${urgent?"bg-red-500":"bg-amber-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{o.name}</p>
                      <p className="text-xs text-gray-400 truncate">{o.productName} · PKR {(o.price*o.quantity).toLocaleString()}</p>
                    </div>
                    <p className={`text-xs font-semibold flex-shrink-0 ${urgent?"text-red-500":"text-amber-600"}`}>
                      {age < 1 ? `${Math.round(age*60)}m` : `${age.toFixed(0)}h`} ago
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </div>
                );
              })}
              {pending.length > 6 && <p className="text-xs text-gray-400 text-center pt-1">{pending.length-6} more…</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── OrdersPage ───────────────────────────────────────────────────────────────
function OrdersPage({ orders, onOpenOrder, onExport, onBulkStatus }: {
  orders: Order[]; onOpenOrder: (o: Order) => void;
  onExport: (orders: Order[]) => void;
  onBulkStatus: (ids: string[], status: OrderStatus) => Promise<void>;
}) {
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<OrderStatus | "all">("all");
  const [dateFilter, setDateFilter]       = useState<DateFilter>("all");
  const [customStart, setCustomStart]     = useState("");
  const [customEnd, setCustomEnd]         = useState("");
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading]     = useState(false);
  const [bulkTarget, setBulkTarget]       = useState<OrderStatus | "">("");

  const todayStr = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    let start: Date | null = null;
    let end: Date | null = null;
    if (dateFilter !== "all" && dateFilter !== "custom") {
      const range = dateRangeFor(dateFilter);
      if (range) { start = range.start; end = range.end; }
    } else if (dateFilter === "custom" && customStart) {
      start = new Date(customStart + "T00:00:00");
      end   = customEnd ? new Date(customEnd + "T23:59:59") : new Date();
    }
    return orders.filter(o => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (start && (!(o.createdAt instanceof Date) || o.createdAt < start)) return false;
      if (end   && (!(o.createdAt instanceof Date) || o.createdAt > end))   return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.name.toLowerCase().includes(q) && !o.phone.includes(q) && !o.id.toLowerCase().includes(q) && !o.city.toLowerCase().includes(q) && !o.productName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, dateFilter, customStart, customEnd, search]);

  const allSel   = filtered.length > 0 && filtered.every(o => selected.has(o.id));
  const toggleAll = () => allSel ? setSelected(new Set()) : setSelected(new Set(filtered.map(o => o.id)));
  const toggleOne = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };
  const selIds   = filtered.filter(o => selected.has(o.id)).map(o => o.id);

  const handleBulkApply = async () => {
    if (!bulkTarget || selIds.length === 0) return;
    setBulkLoading(true);
    await onBulkStatus(selIds, bulkTarget);
    setBulkLoading(false);
    setSelected(new Set());
    setBulkTarget("");
  };

  return (
    <div className="p-5 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} of {orders.length} orders</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <select value={bulkTarget} onChange={e => setBulkTarget(e.target.value as OrderStatus | "")}
                className="text-xs font-semibold border border-gray-200 rounded-xl bg-white px-3 py-2 focus:outline-none text-gray-700">
                <option value="">— Set status —</option>
                {(Object.keys(SC) as OrderStatus[]).map(s => <option key={s} value={s}>{SC[s].label}</option>)}
              </select>
              <button disabled={bulkLoading || !bulkTarget}
                onClick={handleBulkApply}
                className="text-xs font-bold bg-[#C4976A] hover:bg-[#b3865a] text-white px-3 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5 transition-colors">
                {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <CheckCheck className="w-3 h-3"/>}
                Apply ({selIds.length})
              </button>
            </div>
          )}
          {selected.size > 0 && (
            <button onClick={() => onExport(filtered.filter(o=>selected.has(o.id)))}
              className="text-xs font-bold bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-xl flex items-center gap-1.5">
              <Download className="w-3 h-3"/> Export {selected.size}
            </button>
          )}
          {selected.size === 0 && (
            <button onClick={() => onExport(filtered)}
              className="text-xs font-semibold border border-gray-200 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
              <Download className="w-3 h-3"/> Export CSV
            </button>
          )}
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, phone, order ID, city…"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>}
        </div>
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value as DateFilter)}
          className="text-sm border border-gray-200 rounded-xl bg-white px-3 py-2.5 focus:outline-none text-gray-700">
          <option value="all">All dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="custom">Custom range…</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as OrderStatus | "all")}
          className="text-sm border border-gray-200 rounded-xl bg-white px-3 py-2.5 focus:outline-none text-gray-700">
          <option value="all">All statuses</option>
          {(Object.keys(SC) as OrderStatus[]).map(s => <option key={s} value={s}>{SC[s].label}</option>)}
        </select>
      </div>
      {/* Custom date range inputs */}
      {dateFilter === "custom" && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0"/>
            <span className="text-xs text-gray-400">From</span>
            <input type="date" value={customStart} max={todayStr}
              onChange={e => setCustomStart(e.target.value)}
              className="text-sm text-gray-700 focus:outline-none bg-transparent"/>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0"/>
            <span className="text-xs text-gray-400">To</span>
            <input type="date" value={customEnd} min={customStart} max={todayStr}
              onChange={e => setCustomEnd(e.target.value)}
              className="text-sm text-gray-700 focus:outline-none bg-transparent"/>
          </div>
          {(customStart || customEnd) && (
            <button onClick={() => { setCustomStart(""); setCustomEnd(""); }}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <RotateCcw className="w-3 h-3"/> Clear
            </button>
          )}
        </div>
      )}
      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="w-10 px-4 py-3"><input type="checkbox" checked={allSel} onChange={toggleAll} className="rounded"/></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">CN</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="w-10 px-4 py-3"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0
                ? <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No orders found</td></tr>
                : filtered.map(o => {
                    const urgent = o.status === "pending" && orderAgeHours(o) > 2;
                    return (
                      <tr key={o.id} onClick={() => onOpenOrder(o)} className={`cursor-pointer hover:bg-gray-50 transition-colors ${urgent?"bg-red-50/30":""}`}>
                        <td className="px-4 py-3" onClick={e=>{e.stopPropagation();toggleOne(o.id);}}>
                          <input type="checkbox" checked={selected.has(o.id)} onChange={()=>toggleOne(o.id)} className="rounded"/>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {urgent && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/>}
                            <span className="font-mono text-xs text-gray-400">#{o.orderNumber ?? o.id.slice(-6).toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{o.name}</p>
                          <p className="text-xs text-gray-400">{o.phone} · {o.city}</p>
                          {o.address && <p className="text-xs text-gray-400 truncate max-w-[200px]">{o.address}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-700 max-w-[180px] truncate">{o.productName}</p>
                          <p className="text-xs text-gray-400">Qty {o.quantity}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">PKR {(o.price*o.quantity).toLocaleString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={o.status} size="sm"/></td>
                        <td className="px-4 py-3">
                          {o.trackingNumber
                            ? <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{o.trackingNumber}</span>
                            : <span className="text-xs text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                        <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-gray-300"/></td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3 pb-28">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No orders found</div>
        ) : filtered.map(o => {
          const urgent = o.status === "pending" && orderAgeHours(o) > 2;
          return (
            <div key={o.id}
              className={`bg-white rounded-2xl border shadow-sm p-4 transition-shadow ${urgent?"border-red-200":"border-gray-100"} ${selected.has(o.id)?"ring-2 ring-gray-900/20":""}`}>
              <div className="flex items-start gap-3 mb-2">
                <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleOne(o.id)}
                  onClick={e => e.stopPropagation()} className="mt-1 rounded flex-shrink-0"/>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenOrder(o)}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {urgent && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"/>}
                        <p className="font-bold text-gray-900 truncate">{o.name}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{o.phone} · {o.city}</p>
                      {o.address && <p className="text-xs text-gray-400 truncate">{o.address}</p>}
                    </div>
                    <StatusBadge status={o.status} size="sm"/>
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-2">{o.productName}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">PKR {(o.price*o.quantity).toLocaleString()}</span>
                    <span className="text-xs text-gray-400">{fmtDate(o.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Mobile floating bulk bar */}
      {selected.size > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-white px-4 py-3 flex items-center gap-2 z-30 shadow-2xl">
          <span className="text-sm font-bold flex-shrink-0">{selected.size} sel.</span>
          <select value={bulkTarget} onChange={e => setBulkTarget(e.target.value as OrderStatus | "")}
            className="flex-1 text-xs font-semibold rounded-xl px-2 py-2 focus:outline-none text-gray-900 bg-white">
            <option value="">Set status…</option>
            {(Object.keys(SC) as OrderStatus[]).map(s => <option key={s} value={s}>{SC[s].label}</option>)}
          </select>
          <button disabled={bulkLoading || !bulkTarget} onClick={handleBulkApply}
            className="text-xs font-bold bg-[#C4976A] text-white px-3 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5">
            {bulkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <CheckCheck className="w-3.5 h-3.5"/>}
          </button>
          <button onClick={() => onExport(filtered.filter(o=>selected.has(o.id)))}
            className="text-xs font-bold bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5"/>
          </button>
          <button onClick={() => setSelected(new Set())} className="p-2 text-gray-400 hover:text-white">
            <X className="w-4 h-4"/>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── LogisticsPage ────────────────────────────────────────────────────────────
function LogisticsPage({ orders, onOpenOrder, onBulkBook }: {
  orders: Order[]; onOpenOrder: (o: Order) => void;
  onBulkBook: (orders: Order[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [booking, setBooking]   = useState(false);
  const needsBooking = orders.filter(o => (o.status==="confirmed"||o.status==="pending") && !o.trackingNumber);
  const inTransit    = orders.filter(o => (o.status==="dispatched"||o.status==="in_transit") && o.trackingNumber);
  const failed       = orders.filter(o => o.status==="failed_delivery");

  const toggleOne = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };
  const allSel = needsBooking.length > 0 && needsBooking.every(o => selected.has(o.id));
  const toggleAll = () => allSel ? setSelected(new Set()) : setSelected(new Set(needsBooking.map(o => o.id)));
  const selOrders = needsBooking.filter(o => selected.has(o.id));

  return (
    <div className="p-5 space-y-5 max-w-7xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Logistics</h2>
        <p className="text-xs text-gray-400 mt-0.5">Courier booking, tracking, and dispatch management</p>
      </div>
      {/* Needs booking */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0"><Truck className="w-4 h-4 text-amber-600"/></div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm">Needs Courier Booking</h3>
            <p className="text-xs text-gray-400">{needsBooking.length} orders ready to ship</p>
          </div>
          {needsBooking.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={toggleAll} className="text-xs text-gray-500 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                {allSel ? "Deselect all" : "Select all"}
              </button>
              {selOrders.length > 0 && (
                <button disabled={booking} onClick={async()=>{setBooking(true);await onBulkBook(selOrders);setSelected(new Set());setBooking(false);}}
                  className="text-xs font-bold bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-50">
                  {booking ? <Loader2 className="w-3 h-3 animate-spin"/> : <Zap className="w-3 h-3"/>}
                  Book {selOrders.length} via PostEx
                </button>
              )}
            </div>
          )}
        </div>
        {needsBooking.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm flex flex-col items-center gap-2">
            <Check className="w-6 h-6 text-green-400"/> All confirmed orders have been booked
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {needsBooking.map(o => (
              <div key={o.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50">
                <input type="checkbox" checked={selected.has(o.id)} onChange={()=>toggleOne(o.id)}
                  onClick={e=>e.stopPropagation()} className="rounded flex-shrink-0"/>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={()=>onOpenOrder(o)}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusBadge status={o.status} size="sm"/>
                    <span className="text-sm font-semibold text-gray-900 truncate">{o.name}</span>
                    {o.orderNumber && <span className="font-mono text-xs text-gray-400">#{o.orderNumber}</span>}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{o.productName} · {o.city}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 flex-shrink-0">PKR {(o.price*o.quantity).toLocaleString()}</p>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-pointer" onClick={()=>onOpenOrder(o)}/>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Active shipments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 rounded-xl flex-shrink-0"><RefreshCw className="w-4 h-4 text-sky-600"/></div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Active Shipments</h3>
              <p className="text-xs text-gray-400">{inTransit.length} with tracking</p>
            </div>
          </div>
        </div>
        {inTransit.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No active shipments</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">CN</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="w-10 px-5 py-3"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inTransit.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onOpenOrder(o)}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-900">{o.name}</p>
                      <p className="text-xs text-gray-400">{o.city}</p>
                    </td>
                    <td className="px-5 py-3"><span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">{o.trackingNumber}</span></td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} size="sm"/></td>
                    <td className="px-5 py-3"><ChevronRight className="w-4 h-4 text-gray-300"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Failed deliveries */}
      {failed.length > 0 && (
        <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-orange-100">
            <div className="p-2 bg-orange-100 rounded-xl flex-shrink-0"><AlertCircle className="w-4 h-4 text-orange-600"/></div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Failed Deliveries</h3>
              <p className="text-xs text-gray-400">{failed.length} require action</p>
            </div>
          </div>
          <div className="divide-y divide-orange-50">
            {failed.map(o => (
              <div key={o.id} onClick={() => onOpenOrder(o)} className="flex items-center gap-3 px-5 py-3.5 hover:bg-orange-50/50 cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{o.name}</p>
                  <p className="text-xs text-gray-400">{o.phone} · {o.city}</p>
                  {o.address && <p className="text-xs text-gray-400 truncate">{o.address}</p>}
                  {o.callNote && <p className="text-xs text-orange-600 mt-0.5 italic truncate">"{o.callNote}"</p>}
                </div>
                <div className="flex-shrink-0 text-right">
                  {o.callAttempts ? <p className="text-xs text-orange-500">{o.callAttempts} call{o.callAttempts!==1?"s":""}</p> : null}
                  <p className="text-sm font-bold text-gray-900">PKR {(o.price*o.quantity).toLocaleString()}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0"/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── InventoryPage ────────────────────────────────────────────────────────────
function InventoryPage({ stock, onSave }: { stock: StockMap; onSave: (id: string, val: number) => Promise<void> }) {
  const [editing, setEditing] = useState<string|null>(null);
  const [val, setVal] = useState("");
  const [saving, setSaving] = useState(false);
  const LOW = 5;
  return (
    <div className="p-5 space-y-5 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Inventory</h2>
        <p className="text-xs text-gray-400 mt-0.5">Current stock levels — click pencil to edit</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {allVariants.map(p => {
            const qty = stock[p.id] ?? 0; const low = qty <= LOW; const out = qty === 0;
            return (
              <div key={p.id} className={`flex items-center gap-4 px-5 py-4 ${out?"bg-red-50/40":low?"bg-amber-50/30":""}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">PKR {p.price.toLocaleString()}</p>
                </div>
                {editing === p.id ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input type="number" min={0} value={val} onChange={e=>setVal(e.target.value)} autoFocus
                      onKeyDown={async e => {
                        if (e.key==="Enter") { setSaving(true); await onSave(p.id,parseInt(val)||0); setSaving(false); setEditing(null); }
                        if (e.key==="Escape") setEditing(null);
                      }}
                      className="w-20 border border-gray-200 rounded-xl px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
                    <button disabled={saving} onClick={async()=>{setSaving(true);await onSave(p.id,parseInt(val)||0);setSaving(false);setEditing(null);}}
                      className="text-xs font-bold text-white bg-gray-900 px-3 py-1.5 rounded-xl disabled:opacity-50">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin"/> : "Save"}
                    </button>
                    <button onClick={()=>setEditing(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4"/></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {out && <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-md">OUT</span>}
                    {!out && low && <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">LOW</span>}
                    <span className={`text-sm font-bold w-8 text-right ${out?"text-red-600":low?"text-amber-700":"text-gray-900"}`}>{qty}</span>
                    <button onClick={()=>{setEditing(p.id);setVal(String(qty));}}
                      className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── AnalyticsPage ────────────────────────────────────────────────────────────
function AnalyticsPage({ orders }: { orders: Order[] }) {
  const totalRevenue = orders
    .filter(o => ["confirmed","dispatched","in_transit","delivered"].includes(o.status))
    .reduce((s,o) => s+o.price*o.quantity, 0);
  const delivered    = orders.filter(o=>o.status==="delivered").length;
  const returned     = orders.filter(o=>o.status==="returned").length;
  const cancelled    = orders.filter(o=>o.status==="cancelled").length;
  const active       = orders.filter(o=>!["cancelled","returned"].includes(o.status)).length;
  const deliveryRate = active > 0 ? ((delivered/active)*100).toFixed(1) : "0.0";
  const avgOrder     = active > 0 ? Math.round(totalRevenue/active) : 0;

  const topProducts = useMemo(() => {
    const map: Record<string,{name:string;count:number;revenue:number}> = {};
    orders.filter(o=>o.status!=="cancelled").forEach(o => {
      const k = o.productId||o.productName;
      if (!map[k]) map[k] = {name:o.productName,count:0,revenue:0};
      map[k].count += o.quantity; map[k].revenue += o.price*o.quantity;
    });
    return Object.values(map).sort((a,b)=>b.count-a.count).slice(0,5);
  }, [orders]);

  const topCities = useMemo(() => {
    const map: Record<string,{count:number;revenue:number}> = {};
    orders.filter(o=>o.status!=="cancelled").forEach(o => {
      const c = o.city.trim();
      if (!map[c]) map[c]={count:0,revenue:0};
      map[c].count++; map[c].revenue+=o.price*o.quantity;
    });
    return Object.entries(map).sort((a,b)=>b[1].count-a[1].count).slice(0,5);
  }, [orders]);

  const maxP = Math.max(...topProducts.map(p=>p.count),1);
  const maxC = Math.max(...topCities.map(c=>c[1].count),1);

  return (
    <div className="p-5 space-y-5 max-w-7xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Analytics</h2>
        <p className="text-xs text-gray-400 mt-0.5">Business performance overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Orders"    value={String(orders.length)} sub="All time" icon={<ShoppingCart className="w-4 h-4"/>}/>
        <KpiCard label="Total Revenue"   value={`PKR ${(totalRevenue/1000).toFixed(1)}k`} sub="Active orders" icon={<TrendingUp className="w-4 h-4"/>}/>
        <KpiCard label="Delivery Rate"   value={`${deliveryRate}%`} sub={`${delivered} delivered`} icon={<CheckCheck className="w-4 h-4"/>}/>
        <KpiCard label="Avg Order Value" value={`PKR ${avgOrder.toLocaleString()}`} sub={`${cancelled} cancelled · ${returned} returned`} icon={<BarChart2 className="w-4 h-4"/>}/>
      </div>
      <RevenueChart orders={orders}/>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No data</p> : topProducts.map((p,i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-700 font-medium truncate pr-2 max-w-[200px]">{p.name}</p>
                  <span className="text-xs text-gray-500 flex-shrink-0">{p.count} sold</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#C4976A] rounded-full" style={{width:`${(p.count/maxP)*100}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Top Cities</h3>
          <div className="space-y-3">
            {topCities.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No data</p> : topCities.map(([city,data],i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-700 font-medium">{city}</p>
                  <span className="text-xs text-gray-500">{data.count} orders · PKR {(data.revenue/1000).toFixed(1)}k</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#C4976A]/70 rounded-full" style={{width:`${(data.count/maxC)*100}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FinancePage ──────────────────────────────────────────────────────────────
function FinancePage({ expenses, onAdd, onDelete }: {
  expenses: Expense[];
  onAdd:    (data: ExpenseData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [type, setType]   = useState<ExpenseType>("stock");
  const [amount, setAmount] = useState("");
  const [note, setNote]   = useState("");
  const [date, setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string|null>(null);
  const [confirmDel, setConfirmDel] = useState<string|null>(null);

  const todayStr      = new Date().toISOString().slice(0, 10);
  const monthStart    = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const todayExp  = expenses.filter(e => e.date === todayStr);
  const monthExp  = expenses.filter(e => e.date >= monthStartStr);

  function calcPL(list: Expense[]) {
    const income  = list.filter(e => EXPENSE_IS_INCOME[e.type]).reduce((s,e) => s + e.amount, 0);
    const costs   = list.filter(e => !EXPENSE_IS_INCOME[e.type]).reduce((s,e) => s + e.amount, 0);
    const byType  = (Object.keys(EXPENSE_LABELS) as ExpenseType[]).map(t => ({
      type: t, total: list.filter(e => e.type === t).reduce((s,e) => s + e.amount, 0),
    }));
    return { income, costs, net: income - costs, byType };
  }

  const today = calcPL(todayExp);
  const month = calcPL(monthExp);

  const handleAdd = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    setSaving(true);
    try {
      await onAdd({ type, amount: amt, note: note.trim() || undefined, date });
      setAmount(""); setNote("");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirmDel !== id) { setConfirmDel(id); return; }
    setDeleting(id);
    try { await onDelete(id); } finally { setDeleting(null); setConfirmDel(null); }
  };

  function PLCard({ title, pl }: { title: string; pl: ReturnType<typeof calcPL> }) {
    const isProfit = pl.net >= 0;
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          <div className={`flex items-center gap-1 text-sm font-extrabold ${isProfit?"text-green-600":"text-red-600"}`}>
            {isProfit ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4"/>}
            PKR {Math.abs(pl.net).toLocaleString()}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Courier Received</span>
            <span className="font-semibold text-green-700">+ PKR {pl.income.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total Costs</span>
            <span className="font-semibold text-red-600">− PKR {pl.costs.toLocaleString()}</span>
          </div>
          {pl.byType.filter(b => !EXPENSE_IS_INCOME[b.type] && b.total > 0).map(b => (
            <div key={b.type} className="flex justify-between text-[11px] text-gray-400 pl-3">
              <span>{EXPENSE_LABELS[b.type]}</span>
              <span>PKR {b.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className={`flex items-center justify-between pt-3 border-t border-gray-100 font-bold text-sm ${isProfit?"text-green-700":"text-red-600"}`}>
          <span>Net {isProfit ? "Profit" : "Loss"}</span>
          <span>PKR {Math.abs(pl.net).toLocaleString()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Finance</h2>
        <p className="text-xs text-gray-400 mt-0.5">Track expenses and courier payments — see your real P&L</p>
      </div>

      {/* P&L cards — today + this month */}
      <div className="grid md:grid-cols-2 gap-4">
        <PLCard title="Today" pl={today}/>
        <PLCard title="This Month" pl={month}/>
      </div>

      {/* Add entry */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Log Entry</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Category</label>
            <select value={type} onChange={e => setType(e.target.value as ExpenseType)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white text-gray-700">
              {(Object.keys(EXPENSE_LABELS) as ExpenseType[]).map(t => (
                <option key={t} value={t}>
                  {EXPENSE_IS_INCOME[t] ? "↑ " : "↓ "}{EXPENSE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Amount (PKR)</label>
            <input type="number" min={1} placeholder="5000"
              value={amount} onChange={e => setAmount(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Date</label>
            <input type="date" max={todayStr}
              value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
          </div>
        </div>
        <div className="flex gap-3">
          <input type="text" placeholder="Note (optional)…"
            value={note} onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
          <button disabled={saving || !amount || parseFloat(amount) <= 0} onClick={handleAdd}
            className="text-sm font-bold bg-[#C4976A] hover:bg-[#b3865a] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>} Add
          </button>
        </div>
      </div>

      {/* Expense log */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Log</h3>
          <span className="text-xs text-gray-400">{expenses.length} entries</span>
        </div>
        {expenses.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center gap-2">
            <DollarSign className="w-6 h-6 text-gray-300"/> No entries yet
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {expenses.map(e => {
              const isIncome = EXPENSE_IS_INCOME[e.type];
              return (
                <div key={e.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${EXPENSE_COLORS[e.type]}`}>
                    {EXPENSE_LABELS[e.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    {e.note && <p className="text-sm text-gray-700 truncate">{e.note}</p>}
                    <p className="text-xs text-gray-400">{e.date}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${isIncome?"text-green-700":"text-gray-900"}`}>
                    {isIncome ? "+" : "−"} PKR {e.amount.toLocaleString()}
                  </span>
                  <button
                    disabled={!!deleting}
                    onClick={() => handleDelete(e.id)}
                    className={`p-1.5 rounded-lg flex-shrink-0 transition-colors disabled:opacity-40 ${
                      confirmDel === e.id
                        ? "bg-red-500 text-white"
                        : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                    }`}
                    title={confirmDel === e.id ? "Tap again to confirm" : "Delete"}>
                    {deleting === e.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5"/>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CreateOrderPanel ─────────────────────────────────────────────────────────
function CreateOrderPanel({ open, onClose, onToast }: {
  open: boolean; onClose: () => void; onToast: (msg: string) => void;
}) {
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [city, setCity]       = useState("");
  const [address, setAddress] = useState("");
  const [productId, setProductId] = useState(allVariants[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote]       = useState("");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const reset = () => { setName(""); setPhone(""); setCity(""); setAddress(""); setProductId(allVariants[0]?.id??""); setQuantity("1"); setNote(""); setError(""); };

  useEffect(() => { if (!open) reset(); }, [open]);

  const selectedVariant = allVariants.find(v => v.id === productId);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !city.trim() || !address.trim() || !selectedVariant) {
      setError("Name, phone, city, address and product are required."); return;
    }
    setSaving(true); setError("");
    try {
      const qty = Math.max(1, parseInt(quantity) || 1);
      await createOrder({
        name: name.trim(), phone: phone.trim(), city: city.trim(),
        address: address.trim(), note: note.trim() || undefined,
        productId, productName: selectedVariant.name,
        price: selectedVariant.price, quantity: qty,
        paymentStatus: "pending",
      });
      onToast("Order created successfully");
      onClose();
    } catch(e) { setError(String(e)); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div onClick={onClose}
        className={`fixed inset-0 bg-black/30 z-[55] transition-opacity duration-300 ${open?"opacity-100":"opacity-0 pointer-events-none"}`}/>
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-[60] flex flex-col transition-transform duration-300 ease-out ${open?"translate-x-0":"translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Create Manual Order</h3>
            <p className="text-xs text-gray-400 mt-0.5">Manually add a COD order to the system</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{error}</div>}
          {[
            { label:"Customer Name", val:name, set:setName, placeholder:"e.g. Ahmed Khan" },
            { label:"Phone", val:phone, set:setPhone, placeholder:"03XX-XXXXXXX" },
            { label:"City", val:city, set:setCity, placeholder:"e.g. Lahore" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{f.label}</label>
              <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Address</label>
            <textarea value={address} onChange={e=>setAddress(e.target.value)} rows={2} placeholder="Full delivery address"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Product</label>
            <select value={productId} onChange={e=>setProductId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white">
              {allVariants.map(v => <option key={v.id} value={v.id}>{v.name} — PKR {v.price.toLocaleString()}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Quantity</label>
            <input type="number" min={1} value={quantity} onChange={e=>setQuantity(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Note (optional)</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Any special instructions"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
          </div>
          {selectedVariant && (
            <div className="bg-[#C4976A]/10 border border-[#C4976A]/30 rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#C4976A] mb-1">Order Summary</p>
              <p className="text-sm font-bold text-gray-900">{selectedVariant.name}</p>
              <p className="text-sm text-gray-600 mt-0.5">
                {Math.max(1,parseInt(quantity)||1)} × PKR {selectedVariant.price.toLocaleString()} = <span className="font-bold">PKR {(Math.max(1,parseInt(quantity)||1)*selectedVariant.price).toLocaleString()}</span>
              </p>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-gray-100 flex-shrink-0">
          <button disabled={saving} onClick={handleSubmit}
            className="w-full text-sm font-bold bg-[#C4976A] hover:bg-[#b3865a] text-white py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>} Create Order
          </button>
        </div>
      </div>
    </>
  );
}

// ─── DetailPanel ──────────────────────────────────────────────────────────────
function DetailPanel({ order, open, onClose, allOrders, onStatusChange, onUpdate, onDelete, onToast }: {
  order: Order|null; open: boolean; onClose: ()=>void; allOrders: Order[];
  onStatusChange: (o:Order, next:OrderStatus) => Promise<void>;
  onUpdate: (id:string, data:Partial<OrderData>) => Promise<void>;
  onDelete: (o:Order) => Promise<void>;
  onToast: (msg:string) => void;
}) {
  const { copied, copy } = useCopy();
  const [statusLoading, setStatusLoading] = useState<OrderStatus|null>(null);
  const [deleting, setDeleting]           = useState(false);
  const [confirmDel, setConfirmDel]       = useState(false);
  const [courierTab, setCourierTab]       = useState<"postex"|"leopard">("postex");
  const [leopardCn, setLeopardCn]         = useState("");
  const [bookLoading, setBookLoading]     = useState(false);
  const [bookError, setBookError]         = useState("");
  const [cancelling, setCancelling]       = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [callNote, setCallNote]           = useState("");
  const [savingCall, setSavingCall]       = useState(false);
  // Edit order details
  const [editing, setEditing]             = useState(false);
  const [editName, setEditName]           = useState("");
  const [editPhone, setEditPhone]         = useState("");
  const [editAddress, setEditAddress]     = useState("");
  const [editCity, setEditCity]           = useState("");
  const [editNote, setEditNote]           = useState("");
  const [savingEdit, setSavingEdit]       = useState(false);
  const [editingOrder, setEditingOrder]   = useState(false);
  const [editPrice, setEditPrice]         = useState("");
  const [editQty, setEditQty]             = useState("");
  const [editProductId, setEditProductId] = useState("");
  const [savingOrder, setSavingOrder]     = useState(false);

  useEffect(() => {
    if (order) {
      setLeopardCn(order.trackingNumber ?? "");
      setCallNote(order.callNote ?? "");
      setBookError("");
      setConfirmDel(false);
      setConfirmCancel(false);
      setEditing(false);
      setEditName(order.name);
      setEditPhone(order.phone);
      setEditAddress(order.address ?? "");
      setEditCity(order.city);
      setEditNote(order.note ?? "");
      setEditingOrder(false);
      setEditPrice(String(order.price));
      setEditQty(String(order.quantity));
      setEditProductId("");
    }
  }, [order?.id]);

  if (!order) return null;

  const total    = order.price * order.quantity;
  const urgent   = order.status === "pending" && orderAgeHours(order) > 2;
  const dupPhone = allOrders.filter(o => o.phone===order.phone && o.id!==order.id);
  const trans    = TRANS[order.status] ?? [];

  const handleStatus = async (next: OrderStatus) => {
    setStatusLoading(next);
    try { await onStatusChange(order, next); onToast(`Status → ${SC[next].label}`); }
    finally { setStatusLoading(null); }
  };

  const handlePostexBook = async () => {
    setBookLoading(true); setBookError("");
    try {
      const r = await postexBook({ orderId:String(order.orderNumber ?? order.id), name:order.name, phone:order.phone,
        address:order.address ?? "", city:order.city, productName:order.productName,
        price:order.price, quantity:order.quantity });
      if (r.ok && r.trackingNumber) {
        await onUpdate(order.id, { trackingNumber:r.trackingNumber, courierName:"postex" });
        await onStatusChange(order, "dispatched");
        onToast(`PostEx booked — ${r.trackingNumber}`);
      } else {
        setBookError(r.error ?? "PostEx booking failed");
      }
    } catch(e) { setBookError(String(e)); }
    finally { setBookLoading(false); }
  };

  const handleLeopardSave = async () => {
    if (!leopardCn.trim()) return;
    setBookLoading(true);
    try {
      await onUpdate(order.id, { trackingNumber:leopardCn.trim(), courierName:"leopard" });
      await onStatusChange(order, "dispatched");
      onToast(`Leopard CN saved — ${leopardCn.trim()}`);
    } finally { setBookLoading(false); }
  };

  const handleCancelBooking = async () => {
    if (!confirmCancel) { setConfirmCancel(true); return; }
    setCancelling(true);
    try {
      // Clear courier fields locally and revert to confirmed. This does not
      // cancel with PostEx — cancel/track actions were removed from the
      // server proxy, so cancel directly via the PostEx merchant portal too.
      await onUpdate(order.id, {
        trackingNumber: undefined, courierName: undefined,
        postexStatus: undefined, postexLastSync: undefined, postexData: undefined,
      });
      await onStatusChange(order, "confirmed");
      setConfirmCancel(false);
      onToast("Booking cleared locally — cancel with PostEx separately if needed");
    } finally { setCancelling(false); }
  };

  const handleLogCall = async () => {
    setSavingCall(true);
    try {
      const attempts = (order.callAttempts ?? 0) + 1;
      await onUpdate(order.id, { callAttempts:attempts, lastCallAt:new Date(), callNote:callNote||undefined });
      onToast(`Call logged (attempt #${attempts})`);
    } finally { setSavingCall(false); }
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      await onUpdate(order.id, {
        name:    editName.trim()    || order.name,
        phone:   editPhone.trim()   || order.phone,
        address: editAddress.trim() || order.address,
        city:    editCity.trim()    || order.city,
        note:    editNote.trim()    || undefined,
        // note: empty string clears the note (intentional)
      });
      setEditing(false);
      onToast("Order details updated");
    } finally { setSavingEdit(false); }
  };

  const handleSaveOrderEdit = async () => {
    setSavingOrder(true);
    try {
      const p = parseInt(editPrice);
      const q = parseInt(editQty);
      const updates: Partial<OrderData> = {};
      if (!isNaN(p) && p > 0) updates.price = p;
      if (!isNaN(q) && q > 0) updates.quantity = q;
      if (editProductId) {
        const v = allVariants.find(x => x.id === editProductId);
        if (v) {
          updates.productId   = editProductId;
          updates.productName = v.name;
          if (isNaN(p) || p === order.price) updates.price = v.price;
        }
      }
      await onUpdate(order.id, updates);
      setEditingOrder(false);
      onToast("Order details updated");
    } finally { setSavingOrder(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    try { await onDelete(order); onToast("Order deleted"); onClose(); }
    finally { setDeleting(false); setConfirmDel(false); }
  };

  return (
    <>
      <div onClick={onClose}
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${open?"opacity-100":"opacity-0 pointer-events-none"}`}/>
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${open?"translate-x-0":"translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {urgent && <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-md">URGENT</span>}
              <span className="font-mono text-xs text-gray-400">Order #{order.orderNumber ?? order.id.slice(-8).toUpperCase()}</span>
            </div>
            <StatusBadge status={order.status}/>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Duplicate phone */}
            {dupPhone.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0"/>
                <p className="text-xs text-orange-700 font-medium">Same phone in {dupPhone.length} other order{dupPhone.length>1?"s":""}</p>
              </div>
            )}
            {/* Customer */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Customer</h4>
                <button onClick={()=>setEditing(e=>!e)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${editing?"bg-gray-200 text-gray-700":"text-gray-400 hover:text-gray-700 hover:bg-gray-200"}`}>
                  <Edit2 className="w-3 h-3"/> {editing ? "Cancel" : "Edit"}
                </button>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">{order.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 font-mono">{order.phone}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <button onClick={()=>copy(order.phone,"phone")} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors" title="Copy phone">
                    {copied==="phone" ? <Check className="w-3.5 h-3.5 text-green-500"/> : <Copy className="w-3.5 h-3.5"/>}
                  </button>
                  <a href={`tel:${order.phone}`} className="p-1.5 hover:bg-green-100 rounded-lg text-gray-400 hover:text-green-600 transition-colors" title="Call">
                    <Phone className="w-3.5 h-3.5"/>
                  </a>
                  <a href={waHref(order)} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-green-100 rounded-lg text-gray-400 hover:text-green-600 transition-colors" title="WhatsApp">
                    <MessageCircle className="w-3.5 h-3.5"/>
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{order.address}</p>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">{order.city}</p>
                </div>
                <button onClick={()=>copy(`${order.address}, ${order.city}`,"addr")} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                  {copied==="addr" ? <Check className="w-3 h-3 text-green-500"/> : <Copy className="w-3 h-3"/>}
                </button>
              </div>
              {/* Status-based WA message copy buttons */}
              {getWAMsgs(order).length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">WhatsApp Messages</p>
                  {getWAMsgs(order).map(m => (
                    <button key={m.key} onClick={()=>copy(m.text, `wa-${m.key}`)}
                      className="w-full flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-xl transition-colors">
                      {copied===`wa-${m.key}` ? <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0"/> : <MessageCircle className="w-3.5 h-3.5 flex-shrink-0"/>}
                      {copied===`wa-${m.key}` ? "Copied!" : `Copy: ${m.label}`}
                    </button>
                  ))}
                </div>
              )}
              {/* Inline edit form */}
              {editing && (
                <div className="space-y-2 pt-1 border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide pt-1">Edit Details</p>
                  {[
                    { label:"Name",    val:editName,    set:setEditName },
                    { label:"Phone",   val:editPhone,   set:setEditPhone },
                    { label:"City",    val:editCity,    set:setEditCity },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                      <input value={f.val} onChange={e=>f.set(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Address</label>
                    <textarea value={editAddress} onChange={e=>setEditAddress(e.target.value)} rows={2}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"/>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Note</label>
                    <input value={editNote} onChange={e=>setEditNote(e.target.value)}
                      placeholder="Order note (optional)"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
                  </div>
                  <button disabled={savingEdit} onClick={handleSaveEdit}
                    className="w-full text-sm font-bold bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                    {savingEdit ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>} Save Changes
                  </button>
                </div>
              )}
            </div>
            {/* Order details */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Order Details</h4>
                <button onClick={() => setEditingOrder(e => !e)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${editingOrder ? "bg-gray-200 text-gray-700" : "text-gray-400 hover:text-gray-700 hover:bg-gray-200"}`}>
                  <Edit2 className="w-3 h-3"/> {editingOrder ? "Cancel" : "Edit"}
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{order.productName}</p>
                <p className="text-xs text-gray-400 mt-0.5">Qty {order.quantity} × PKR {order.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-xs font-semibold text-gray-500">COD Total</span>
                <span className="text-base font-extrabold text-gray-900">PKR {total.toLocaleString()}</span>
              </div>
              {order.note && (
                <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                  <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0"/>
                  <p className="text-sm text-gray-600 italic">{order.note}</p>
                </div>
              )}
              {editingOrder && (
                <div className="space-y-3 pt-2 border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Edit Order</p>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Swap Product (optional)</label>
                    <select value={editProductId} onChange={e => {
                      setEditProductId(e.target.value);
                      if (e.target.value) {
                        const v = allVariants.find(x => x.id === e.target.value);
                        if (v) setEditPrice(String(v.price));
                      }
                    }} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white">
                      <option value="">— keep current product —</option>
                      {allVariants.map(v => (
                        <option key={v.id} value={v.id}>{v.name} — PKR {v.price.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Unit Price (PKR)</label>
                      <input type="number" min={1} value={editPrice} onChange={e => setEditPrice(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
                      <input type="number" min={1} value={editQty} onChange={e => setEditQty(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    New total: PKR {((parseInt(editPrice) || order.price) * (parseInt(editQty) || order.quantity)).toLocaleString()}
                  </p>
                  <button disabled={savingOrder} onClick={handleSaveOrderEdit}
                    className="w-full text-sm font-bold bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                    {savingOrder ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>} Save
                  </button>
                </div>
              )}
            </div>
            {/* Payment collected */}
            {order.status === "delivered" && order.paymentStatus !== "paid" && (
              <button onClick={async () => { await onUpdate(order.id, { paymentStatus: "paid" }); onToast("Payment marked as received"); }}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl transition-colors">
                <CheckCheck className="w-4 h-4" /> Mark Payment Received
              </button>
            )}
            {order.status === "delivered" && order.paymentStatus === "paid" && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-100 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-green-700">Cash payment received</p>
              </div>
            )}
            {/* Status transitions */}
            {trans.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {trans.map(t => (
                    <button key={t.next} disabled={!!statusLoading} onClick={()=>handleStatus(t.next)}
                      className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 ${
                        t.primary ? "bg-[#C4976A] hover:bg-[#b3865a] text-white" :
                        t.danger  ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200" :
                        "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}>
                      {statusLoading===t.next && <Loader2 className="w-3.5 h-3.5 animate-spin"/>}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Courier section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Courier</h4>
              {order.trackingNumber ? (
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 capitalize">{order.courierName ?? "Courier"}</p>
                      <p className="font-mono font-bold text-gray-900 text-sm mt-0.5">{order.trackingNumber}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={()=>copy(order.trackingNumber!,"cn")} className="p-2 hover:bg-gray-200 rounded-xl text-gray-400 hover:text-gray-600" title="Copy CN">
                        {copied==="cn" ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>
                  {(order.status==="dispatched"||order.status==="in_transit") && (
                    <a href={waHref(order)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2.5 rounded-xl transition-colors">
                      <MessageCircle className="w-4 h-4"/> Open in WhatsApp
                    </a>
                  )}
                  <button disabled={cancelling} onClick={handleCancelBooking}
                    className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-xl transition-colors disabled:opacity-50 ${
                      confirmCancel
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-200"
                    }`}>
                    {cancelling
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin"/>
                      : <XOctagon className="w-3.5 h-3.5"/>}
                    {confirmCancel ? "Tap again — clears locally (cancel with PostEx separately)" : "Cancel Booking & Re-book"}
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <div className="flex rounded-xl bg-gray-200 p-0.5">
                    {(["postex","leopard"] as const).map(t => (
                      <button key={t} onClick={()=>setCourierTab(t)}
                        className={`flex-1 text-sm font-bold py-1.5 rounded-[10px] transition-colors ${courierTab===t?"bg-white text-gray-900 shadow-sm":"text-gray-500"}`}>
                        {t==="postex"?"PostEx":"Leopard"}
                      </button>
                    ))}
                  </div>
                  {courierTab==="postex" ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Auto-book via PostEx API. Order will be marked dispatched.</p>
                      {bookError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{bookError}</p>}
                      <button disabled={bookLoading} onClick={handlePostexBook}
                        className="w-full text-sm font-bold bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                        {bookLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4"/>} Book PostEx
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Enter Leopard CN manually.</p>
                      <input value={leopardCn} onChange={e=>setLeopardCn(e.target.value)} placeholder="CN number…"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"/>
                      <button disabled={bookLoading||!leopardCn.trim()} onClick={handleLeopardSave}
                        className="w-full text-sm font-bold bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                        {bookLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>} Save CN
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Call log */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Call Log</h4>
                {!!order.callAttempts && (
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    {order.callAttempts} attempt{order.callAttempts>1?"s":""}
                  </span>
                )}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                {order.lastCallAt && (
                  <p className="text-xs text-gray-400">Last called: {fmtDate(order.lastCallAt)}</p>
                )}
                <textarea value={callNote} onChange={e=>setCallNote(e.target.value)}
                  placeholder="Call note (optional)…" rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"/>
                <button disabled={savingCall} onClick={handleLogCall}
                  className="w-full text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                  {savingCall ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Phone className="w-3.5 h-3.5"/>} Log Call Attempt
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex-shrink-0">
          <button disabled={deleting} onClick={handleDelete}
            className={`w-full text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors ${
              confirmDel ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600"
            }`}>
            {deleting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
            {confirmDel ? "Tap again to confirm delete" : "Delete Order"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ page, onPage, pendingCount, onSignOut, mobileOpen, onMobileClose }: {
  page: Page; onPage: (p:Page)=>void; pendingCount: number;
  onSignOut: ()=>void; mobileOpen: boolean; onMobileClose: ()=>void;
}) {
  const nav: {p:Page;label:string;icon:React.ReactNode}[] = [
    {p:"dashboard", label:"Dashboard",  icon:<LayoutDashboard className="w-4 h-4"/>},
    {p:"orders",    label:"Orders",     icon:<ShoppingCart className="w-4 h-4"/>},
    {p:"logistics", label:"Logistics",  icon:<Truck className="w-4 h-4"/>},
    {p:"inventory", label:"Inventory",  icon:<Package className="w-4 h-4"/>},
    {p:"analytics", label:"Analytics",  icon:<BarChart2 className="w-4 h-4"/>},
    {p:"finance",   label:"Finance",    icon:<DollarSign className="w-4 h-4"/>},
  ];
  const inner = (
    <div className="flex flex-col h-full bg-[#111827]">
      <div className="px-5 py-6 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C4976A] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xs">Z</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">ZARAAR</p>
            <p className="text-[#6B7280] text-[10px] mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = page===item.p;
          return (
            <button key={item.p} onClick={()=>{onPage(item.p);onMobileClose();}}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                active ? "bg-[#C4976A]/15 text-[#C4976A]" : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
              }`}>
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.p==="orders" && pendingCount>0 && (
                <span className="text-[10px] font-black bg-[#C4976A] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{pendingCount}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="px-3 pb-6 pt-3 flex-shrink-0 border-t border-white/5">
        <button onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors">
          <LogOut className="w-4 h-4"/> Sign Out
        </button>
      </div>
    </div>
  );
  return (
    <>
      <aside className="hidden md:flex w-[220px] flex-shrink-0 h-screen sticky top-0">{inner}</aside>
      <div className={`md:hidden fixed inset-0 z-50 flex transition-opacity duration-300 ${mobileOpen?"opacity-100":"opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/50" onClick={onMobileClose}/>
        <div className={`relative w-64 h-full transition-transform duration-300 ${mobileOpen?"translate-x-0":"-translate-x-full"}`}>{inner}</div>
      </div>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [authLoading, setAuthLoading]   = useState(true);
  const [page, setPage]                 = useState<Page>("dashboard");
  const [orders, setOrders]             = useState<Order[]>([]);
  const [stock, setStockState]          = useState<StockMap>({});
  const [expenses, setExpenses]         = useState<Expense[]>([]);
  const [selectedId, setSelectedId]     = useState<string|null>(null);
  const [panelOpen, setPanelOpen]       = useState(false);
  const [createOpen, setCreateOpen]     = useState(false);
  const [toast, setToast]               = useState<string|null>(null);
  const [mobileMenu, setMobileMenu]     = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevPendingRef                  = useRef<number>(0);
  const firstLoad                       = useRef(true);
  const statsTimer                      = useRef<ReturnType<typeof setTimeout>|null>(null);

  const selectedOrder = useMemo(() => selectedId ? (orders.find(o=>o.id===selectedId)??null) : null, [orders, selectedId]);

  useEffect(() => {
    return onAuthStateChanged(auth, user => { if (!user) router.replace("/admin"); else setAuthLoading(false); });
  }, [router]);

  useEffect(() => {
    if (authLoading) return;
    const unsub1 = subscribeToOrders(setOrders);
    const unsub2 = subscribeToStock(setStockState);
    const unsub3 = subscribeToExpenses(setExpenses);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [authLoading]);

  // Keep public stats (storefront counter) in sync — debounced 8s after any order change
  useEffect(() => {
    if (!orders.length) return;
    if (statsTimer.current) clearTimeout(statsTimer.current);
    statsTimer.current = setTimeout(() => updatePublicStats(orders), 8000);
    return () => { if (statsTimer.current) clearTimeout(statsTimer.current); };
  }, [orders]);

  // Play sound when new pending orders arrive (skip initial load)
  useEffect(() => {
    const current = orders.filter(o => o.status === "pending").length;
    if (firstLoad.current) { firstLoad.current = false; prevPendingRef.current = current; return; }
    if (soundEnabled && current > prevPendingRef.current) playNewOrderSound();
    prevPendingRef.current = current;
  }, [orders, soundEnabled]);

  const openOrder = useCallback((o: Order) => { setSelectedId(o.id); setPanelOpen(true); }, []);
  const closePanel = useCallback(() => { setPanelOpen(false); setTimeout(() => setSelectedId(null), 300); }, []);
  const showToast = useCallback((msg: string) => setToast(msg), []);

  const handleStatusChange = useCallback(async (o: Order, next: OrderStatus) => {
    const delta = stockDelta(o.status, next, o.quantity);
    await updateOrderStatus(o.id, next);
    if (delta !== 0) await adjustStock(o.productId, delta);
  }, []);

  const handleUpdate = useCallback(async (id: string, data: Partial<OrderData>) => {
    await updateOrder(id, data);
  }, []);

  const handleDelete = useCallback(async (o: Order) => { await deleteOrder(o.id); }, []);

  const handleBulkStatus = useCallback(async (ids: string[], status: OrderStatus) => {
    await Promise.all(ids.map(id => {
      const o = orders.find(x=>x.id===id);
      return o ? handleStatusChange(o, status) : Promise.resolve();
    }));
    showToast(`${ids.length} order${ids.length!==1?"s":""} → ${SC[status].label}`);
  }, [orders, handleStatusChange, showToast]);

  const handleSaveStock = useCallback(async (id: string, val: number) => { await setStock(id, val); }, []);
  const handleAddExpense = useCallback(async (data: ExpenseData) => { await addExpense(data); }, []);
  const handleDeleteExpense = useCallback(async (id: string) => { await deleteExpense(id); }, []);

  const handleBulkBook = useCallback(async (toBook: Order[]) => {
    let booked = 0, failed = 0;
    await Promise.all(toBook.map(async o => {
      try {
        const r = await postexBook({ orderId:String(o.orderNumber ?? o.id), name:o.name, phone:o.phone,
          address:o.address ?? "", city:o.city, productName:o.productName, price:o.price, quantity:o.quantity });
        if (r.ok && r.trackingNumber) {
          await handleUpdate(o.id, { trackingNumber:r.trackingNumber, courierName:"postex" });
          await handleStatusChange(o, "dispatched");
          booked++;
        } else { failed++; }
      } catch { failed++; }
    }));
    showToast(`PostEx: ${booked} booked${failed>0?`, ${failed} failed`:""}`);
  }, [handleUpdate, handleStatusChange, showToast]);

  const handleSignOut = async () => { await signOut(auth); router.replace("/admin"); };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#C4976A] flex items-center justify-center">
            <span className="text-white font-black text-sm">Z</span>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-[#C4976A]"/>
        </div>
      </div>
    );
  }

  const pendingCount = orders.filter(o=>o.status==="pending").length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F3F4F6]">
      <Sidebar page={page} onPage={setPage} pendingCount={pendingCount}
        onSignOut={handleSignOut} mobileOpen={mobileMenu} onMobileClose={()=>setMobileMenu(false)}/>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111827] flex-shrink-0">
          <button onClick={()=>setMobileMenu(true)} className="p-2 text-white hover:bg-white/10 rounded-xl">
            <Menu className="w-5 h-5"/>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#C4976A] flex items-center justify-center">
              <span className="text-white font-black text-[10px]">Z</span>
            </div>
            <span className="text-white font-bold text-sm">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={()=>setSoundEnabled(e=>!e)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl" title={soundEnabled?"Mute alerts":"Unmute alerts"}>
              {soundEnabled ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
            </button>
            <button onClick={()=>setCreateOpen(true)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl" title="Create order">
              <Plus className="w-4 h-4"/>
            </button>
            {pendingCount > 0 && (
              <span className="text-[10px] font-black bg-[#C4976A] text-white px-2 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </div>
        </header>
        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-end gap-2 px-5 py-3 bg-white border-b border-gray-100 flex-shrink-0">
          <button onClick={()=>setSoundEnabled(e=>!e)}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors" title={soundEnabled?"Mute alerts":"Unmute alerts"}>
            {soundEnabled ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
          </button>
          <button onClick={()=>setCreateOpen(true)}
            className="flex items-center gap-2 text-sm font-bold bg-[#C4976A] hover:bg-[#b3865a] text-white px-4 py-2 rounded-xl transition-colors">
            <Plus className="w-4 h-4"/> New Order
          </button>
        </div>
        <main className="flex-1 overflow-y-auto">
          {page==="dashboard" && <DashboardPage orders={orders} onOpenOrder={openOrder}/>}
          {page==="orders"    && <OrdersPage orders={orders} onOpenOrder={openOrder} onExport={exportCSV} onBulkStatus={handleBulkStatus}/>}
          {page==="logistics" && <LogisticsPage orders={orders} onOpenOrder={openOrder} onBulkBook={handleBulkBook}/>}
          {page==="inventory" && <InventoryPage stock={stock} onSave={handleSaveStock}/>}
          {page==="analytics" && <AnalyticsPage orders={orders}/>}
          {page==="finance"   && <FinancePage expenses={expenses} onAdd={handleAddExpense} onDelete={handleDeleteExpense}/>}
        </main>
      </div>
      <CreateOrderPanel open={createOpen} onClose={()=>setCreateOpen(false)} onToast={showToast}/>
      <DetailPanel order={selectedOrder} open={panelOpen} onClose={closePanel}
        allOrders={orders} onStatusChange={handleStatusChange} onUpdate={handleUpdate}
        onDelete={handleDelete} onToast={showToast}/>
      {toast && <Toast msg={toast} onDone={()=>setToast(null)}/>}
    </div>
  );
}
