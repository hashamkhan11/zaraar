import { Bell, Clock, ShoppingCart, TrendingUp, CheckCheck, ChevronRight } from "lucide-react";
import { Order, OrderStatus, getOrderTotal, getOrderProductLabel } from "@/lib/orders";
import { KpiCard } from "../components/KpiCard";
import { RevenueChart } from "../components/RevenueChart";
import { SC } from "../statusConfig";
import { orderAgeHours } from "../utils";

export function DashboardPage({ orders, onOpenOrder }: {
  orders: Order[]; onOpenOrder: (o: Order) => void;
}) {
  const pending     = orders.filter(o => o.status === "pending");
  const today       = new Date(); today.setHours(0,0,0,0);
  const todayOrders = orders.filter(o => o.createdAt instanceof Date && o.createdAt >= today);
  const weekStart   = new Date(today); weekStart.setDate(weekStart.getDate() - 6);
  const weekRevenue = orders
    .filter(o => ["confirmed","dispatched","in_transit","delivered"].includes(o.status) && o.createdAt instanceof Date && o.createdAt >= weekStart)
    .reduce((s,o) => s + getOrderTotal(o), 0);
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
          sub={`PKR ${todayOrders.reduce((s,o) => s+getOrderTotal(o),0).toLocaleString()}`}
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
                      <p className="text-xs text-gray-400 truncate">{getOrderProductLabel(o)} · PKR {getOrderTotal(o).toLocaleString()}</p>
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
