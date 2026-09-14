import { useState } from "react";
import { Truck, Loader2, Zap, Check, RefreshCw, AlertCircle, ChevronRight } from "lucide-react";
import { Order, getOrderProductLabel, getOrderTotal } from "@/lib/orders";
import { StatusBadge } from "../components/StatusBadge";

export function LogisticsPage({ orders, onOpenOrder, onBulkBook }: {
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
                  <p className="text-xs text-gray-400 truncate">{getOrderProductLabel(o)} · {o.city}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 flex-shrink-0">PKR {getOrderTotal(o).toLocaleString()}</p>
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
                  {o.callNote && <p className="text-xs text-orange-600 mt-0.5 italic truncate">&quot;{o.callNote}&quot;</p>}
                </div>
                <div className="flex-shrink-0 text-right">
                  {o.callAttempts ? <p className="text-xs text-orange-500">{o.callAttempts} call{o.callAttempts!==1?"s":""}</p> : null}
                  <p className="text-sm font-bold text-gray-900">PKR {getOrderTotal(o).toLocaleString()}</p>
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
