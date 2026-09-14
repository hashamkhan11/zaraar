import type { ReactNode } from "react";
import { LayoutDashboard, ShoppingCart, Truck, Package, BarChart2, DollarSign, LogOut } from "lucide-react";
import { Page } from "../types";

export function Sidebar({ page, onPage, pendingCount, onSignOut, mobileOpen, onMobileClose }: {
  page: Page; onPage: (p:Page)=>void; pendingCount: number;
  onSignOut: ()=>void; mobileOpen: boolean; onMobileClose: ()=>void;
}) {
  const nav: {p:Page;label:string;icon:ReactNode}[] = [
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
          <div className="w-8 h-8 rounded-xl bg-[#C9A84C] flex items-center justify-center flex-shrink-0">
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
                active ? "bg-[#C9A84C]/15 text-[#C9A84C]" : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
              }`}>
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.p==="orders" && pendingCount>0 && (
                <span className="text-[10px] font-black bg-[#C9A84C] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{pendingCount}</span>
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
