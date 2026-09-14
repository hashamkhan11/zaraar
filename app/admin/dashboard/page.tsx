"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  subscribeToOrders, updateOrderStatus, updateOrder, deleteOrder,
  updatePublicStats, Order, OrderStatus, OrderData, getOrderItems,
} from "@/lib/orders";
import { subscribeToStock, setStock, adjustStock, StockMap } from "@/lib/stock";
import { subscribeToExpenses, addExpense, deleteExpense, Expense, ExpenseData } from "@/lib/finance";
import { postexBook } from "@/lib/postex";
import { Loader2, Menu, Plus, Volume2, VolumeX } from "lucide-react";
import { Page } from "./types";
import { SC } from "./statusConfig";
import { stockDelta, playNewOrderSound, exportCSV, postexParamsFor } from "./utils";
import { Sidebar } from "./components/Sidebar";
import { Toast } from "./components/Toast";
import { DashboardPage } from "./overview/OverviewPage";
import { OrdersPage } from "./orders/OrdersPage";
import { DetailPanel } from "./orders/DetailPanel";
import { CreateOrderPanel } from "./orders/CreateOrderPanel";
import { LogisticsPage } from "./logistics/LogisticsPage";
import { InventoryPage } from "./inventory/InventoryPage";
import { AnalyticsPage } from "./analytics/AnalyticsPage";
import { FinancePage } from "./finance/FinancePage";

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
    await updateOrderStatus(o.id, next);
    for (const item of getOrderItems(o)) {
      const delta = stockDelta(o.status, next, item.quantity);
      if (delta !== 0) await adjustStock(item.productId, delta);
    }
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

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    await Promise.all(ids.map(id => deleteOrder(id)));
    showToast(`${ids.length} order${ids.length!==1?"s":""} deleted`);
  }, [showToast]);

  const handleSaveStock = useCallback(async (id: string, val: number) => { await setStock(id, val); }, []);
  const handleAddExpense = useCallback(async (data: ExpenseData) => { await addExpense(data); }, []);
  const handleDeleteExpense = useCallback(async (id: string) => { await deleteExpense(id); }, []);

  const handleBulkBook = useCallback(async (toBook: Order[]) => {
    let booked = 0, failed = 0;
    await Promise.all(toBook.map(async o => {
      try {
        const r = await postexBook({ orderId:String(o.orderNumber ?? o.id), name:o.name, phone:o.phone,
          address:o.address ?? "", city:o.city, ...postexParamsFor(o) });
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
          <div className="w-10 h-10 rounded-2xl bg-[#C9A84C] flex items-center justify-center">
            <span className="text-white font-black text-sm">Z</span>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-[#C9A84C]"/>
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
            <div className="w-7 h-7 rounded-xl bg-[#C9A84C] flex items-center justify-center">
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
              <span className="text-[10px] font-black bg-[#C9A84C] text-white px-2 py-0.5 rounded-full">{pendingCount}</span>
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
            className="flex items-center gap-2 text-sm font-bold bg-[#C9A84C] hover:bg-[#B8954A] text-white px-4 py-2 rounded-xl transition-colors">
            <Plus className="w-4 h-4"/> New Order
          </button>
        </div>
        <main className="flex-1 overflow-y-auto">
          {page==="dashboard" && <DashboardPage orders={orders} onOpenOrder={openOrder}/>}
          {page==="orders"    && <OrdersPage orders={orders} onOpenOrder={openOrder} onExport={exportCSV} onBulkStatus={handleBulkStatus} onBulkDelete={handleBulkDelete}/>}
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
