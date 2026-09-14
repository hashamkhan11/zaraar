import { useState, useMemo } from "react";
import { Search, Download, Calendar, RotateCcw, X, CheckCheck, Trash2, Loader2, ChevronRight } from "lucide-react";
import { Order, OrderStatus, getOrderItems, getOrderQuantity, getOrderTotal, getOrderProductLabel } from "@/lib/orders";
import { DateFilter } from "../types";
import { SC } from "../statusConfig";
import { dateRangeFor, fmtDate, orderAgeHours } from "../utils";
import { StatusBadge } from "../components/StatusBadge";

export function OrdersPage({ orders, onOpenOrder, onExport, onBulkStatus, onBulkDelete }: {
  orders: Order[]; onOpenOrder: (o: Order) => void;
  onExport: (orders: Order[]) => void;
  onBulkStatus: (ids: string[], status: OrderStatus) => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<void>;
}) {
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<OrderStatus | "all">("all");
  const [dateFilter, setDateFilter]       = useState<DateFilter>("all");
  const [customStart, setCustomStart]     = useState("");
  const [customEnd, setCustomEnd]         = useState("");
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading]     = useState(false);
  const [bulkTarget, setBulkTarget]       = useState<OrderStatus | "">("");
  const [bulkDeleting, setBulkDeleting]   = useState(false);
  const [confirmBulkDel, setConfirmBulkDel] = useState(false);

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
        const matchesProduct = getOrderItems(o).some(i => i.productName.toLowerCase().includes(q));
        if (!o.name.toLowerCase().includes(q) && !o.phone.includes(q) && !o.id.toLowerCase().includes(q) && !o.city.toLowerCase().includes(q) && !matchesProduct) return false;
      }
      return true;
    });
  }, [orders, statusFilter, dateFilter, customStart, customEnd, search]);

  const allSel   = filtered.length > 0 && filtered.every(o => selected.has(o.id));
  const toggleAll = () => { setConfirmBulkDel(false); allSel ? setSelected(new Set()) : setSelected(new Set(filtered.map(o => o.id))); };
  const toggleOne = (id: string) => { setConfirmBulkDel(false); const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };
  const selIds   = filtered.filter(o => selected.has(o.id)).map(o => o.id);

  const handleBulkApply = async () => {
    if (!bulkTarget || selIds.length === 0) return;
    setBulkLoading(true);
    await onBulkStatus(selIds, bulkTarget);
    setBulkLoading(false);
    setSelected(new Set());
    setBulkTarget("");
  };

  const handleBulkDeleteClick = async () => {
    if (selIds.length === 0) return;
    if (!confirmBulkDel) { setConfirmBulkDel(true); return; }
    setBulkDeleting(true);
    await onBulkDelete(selIds);
    setBulkDeleting(false);
    setConfirmBulkDel(false);
    setSelected(new Set());
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
                className="text-xs font-bold bg-[#C9A84C] hover:bg-[#B8954A] text-white px-3 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5 transition-colors">
                {bulkLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <CheckCheck className="w-3 h-3"/>}
                Apply ({selIds.length})
              </button>
              <button disabled={bulkDeleting}
                onClick={handleBulkDeleteClick}
                onBlur={() => setConfirmBulkDel(false)}
                className={`text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5 transition-colors ${confirmBulkDel ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-50 hover:bg-red-100 text-red-600"}`}>
                {bulkDeleting ? <Loader2 className="w-3 h-3 animate-spin"/> : <Trash2 className="w-3 h-3"/>}
                {confirmBulkDel ? `Confirm delete (${selIds.length})` : `Delete (${selIds.length})`}
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
            className="admin-input pl-9"/>
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
                          <p className="text-gray-700 max-w-[180px] truncate">{getOrderProductLabel(o)}</p>
                          <p className="text-xs text-gray-400">Qty {getOrderQuantity(o)}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">PKR {getOrderTotal(o).toLocaleString()}</td>
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
                  <p className="text-sm text-gray-600 truncate mb-2">{getOrderProductLabel(o)}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">PKR {getOrderTotal(o).toLocaleString()}</span>
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
            className="text-xs font-bold bg-[#C9A84C] text-white px-3 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5">
            {bulkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <CheckCheck className="w-3.5 h-3.5"/>}
          </button>
          <button disabled={bulkDeleting} onClick={handleBulkDeleteClick} onBlur={() => setConfirmBulkDel(false)}
            className={`text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-50 flex items-center gap-1.5 ${confirmBulkDel ? "bg-red-600" : "bg-red-700/60"}`}>
            {bulkDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5"/>}
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
