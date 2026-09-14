import { useMemo } from "react";
import { BarChart2 } from "lucide-react";
import { Order, OrderStatus, getOrderTotal } from "@/lib/orders";
import { fmtDay } from "../utils";

export function RevenueChart({ orders }: { orders: Order[] }) {
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
        revenue: dayOrders.reduce((s,o) => s + getOrderTotal(o), 0), count: dayOrders.length });
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
        <BarChart2 className="w-4 h-4 text-[#C9A84C]" />
      </div>
      <div className="flex items-end gap-2 h-28">
        {days.map((d,i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full rounded-t-lg bg-[#C9A84C]/70 hover:bg-[#C9A84C] transition-colors"
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
