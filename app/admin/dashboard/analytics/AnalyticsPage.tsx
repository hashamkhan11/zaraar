import { useMemo } from "react";
import { ShoppingCart, TrendingUp, CheckCheck, BarChart2 } from "lucide-react";
import { Order, getOrderItems, getOrderTotal } from "@/lib/orders";
import { KpiCard } from "../components/KpiCard";
import { RevenueChart } from "../components/RevenueChart";

export function AnalyticsPage({ orders }: { orders: Order[] }) {
  const totalRevenue = orders
    .filter(o => ["confirmed","dispatched","in_transit","delivered"].includes(o.status))
    .reduce((s,o) => s+getOrderTotal(o), 0);
  const delivered    = orders.filter(o=>o.status==="delivered").length;
  const returned     = orders.filter(o=>o.status==="returned").length;
  const cancelled    = orders.filter(o=>o.status==="cancelled").length;
  const active       = orders.filter(o=>!["cancelled","returned"].includes(o.status)).length;
  const deliveryRate = active > 0 ? ((delivered/active)*100).toFixed(1) : "0.0";
  const avgOrder     = active > 0 ? Math.round(totalRevenue/active) : 0;

  const topProducts = useMemo(() => {
    const map: Record<string,{name:string;count:number;revenue:number}> = {};
    orders.filter(o=>o.status!=="cancelled").forEach(o => {
      for (const item of getOrderItems(o)) {
        const k = item.productId||item.productName;
        if (!map[k]) map[k] = {name:item.productName,count:0,revenue:0};
        map[k].count += item.quantity; map[k].revenue += item.price * item.quantity;
      }
    });
    return Object.values(map).sort((a,b)=>b.count-a.count).slice(0,5);
  }, [orders]);

  const topCities = useMemo(() => {
    const map: Record<string,{count:number;revenue:number}> = {};
    orders.filter(o=>o.status!=="cancelled").forEach(o => {
      const c = o.city.trim();
      if (!map[c]) map[c]={count:0,revenue:0};
      map[c].count++; map[c].revenue+=getOrderTotal(o);
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
                  <div className="h-full bg-[#C9A84C] rounded-full" style={{width:`${(p.count/maxP)*100}%`}}/>
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
                  <div className="h-full bg-[#C9A84C]/70 rounded-full" style={{width:`${(data.count/maxC)*100}%`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
