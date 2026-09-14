import { useState, useEffect } from "react";
import { deleteField } from "firebase/firestore";
import {
  X, Loader2, CheckCheck, Trash2, Copy, Check, MessageCircle, Edit2, Phone, Zap,
  MapPin, FileText, ChevronRight, Plus, XOctagon, CheckCircle2, RotateCcw,
} from "lucide-react";
import { Order, OrderStatus, OrderData, OrderItem, getOrderItems, getOrderTotal, getOrderProductLabel } from "@/lib/orders";
import { postexBook, postexCancel } from "@/lib/postex";
import { POSTEX_STATUS_STYLE, SC, TRANS } from "../statusConfig";
import { fmtDate, orderAgeHours, OPEN_PARCEL_NOTE, postexParamsFor, allVariants, useCopy } from "../utils";
import { waHref, waHrefWithText, getWAMsgs } from "../whatsapp";
import { StatusBadge } from "../components/StatusBadge";

export function DetailPanel({ order, open, onClose, allOrders, onStatusChange, onUpdate, onDelete, onToast }: {
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
  const [courierInstr, setCourierInstr]   = useState<"none"|"open"|"custom">("none");
  const [customInstr, setCustomInstr]     = useState("");
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
  const [editLines, setEditLines]         = useState<{ productId: string; price: string; quantity: string }[]>([]);
  const [editDeliveryFee, setEditDeliveryFee] = useState("0");
  const [savingOrder, setSavingOrder]     = useState(false);
  const [showHistory, setShowHistory]     = useState(false);
  const [waOpenKey, setWaOpenKey]         = useState<string|null>(null);
  const [waDrafts, setWaDrafts]           = useState<Record<string,string>>({});

  useEffect(() => {
    if (order) {
      setLeopardCn(order.trackingNumber ?? "");
      setCallNote(order.callNote ?? "");
      setBookError("");
      if (order.courierNote === OPEN_PARCEL_NOTE) { setCourierInstr("open"); setCustomInstr(""); }
      else if (order.courierNote) { setCourierInstr("custom"); setCustomInstr(order.courierNote); }
      else { setCourierInstr("none"); setCustomInstr(""); }
      setConfirmDel(false);
      setConfirmCancel(false);
      setEditing(false);
      setEditName(order.name);
      setEditPhone(order.phone);
      setEditAddress(order.address ?? "");
      setEditCity(order.city);
      setEditNote(order.note ?? "");
      setEditingOrder(false);
      setEditLines(getOrderItems(order).map(i => ({ productId: i.productId, price: String(i.price), quantity: String(i.quantity) })));
      setEditDeliveryFee(String(order.deliveryFee ?? 0));
      setShowHistory(false);
      setWaOpenKey(null);
      setWaDrafts({});
    }
  }, [order?.id]);

  if (!order) return null;

  const total    = getOrderTotal(order);
  const items    = getOrderItems(order);
  const urgent   = order.status === "pending" && orderAgeHours(order) > 2;
  const dupPhone = allOrders.filter(o => o.phone===order.phone && o.id!==order.id);
  const trans    = TRANS[order.status] ?? [];

  const updateEditLine = (i: number, patch: Partial<{ productId: string; price: string; quantity: string }>) => {
    setEditLines(prev => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  };
  const setEditLineProduct = (i: number, productId: string) => {
    const v = allVariants.find(v => v.id === productId);
    updateEditLine(i, { productId, price: String(v?.price ?? "") });
  };
  const addEditLine = () => setEditLines(prev => [...prev, { productId: allVariants[0]?.id ?? "", price: String(allVariants[0]?.price ?? ""), quantity: "1" }]);
  const removeEditLine = (i: number) => setEditLines(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev);

  const parsedEditLines = editLines.map(l => ({
    variant: allVariants.find(v => v.id === l.productId),
    price: parseFloat(l.price) || 0,
    quantity: Math.max(1, parseInt(l.quantity) || 1),
  }));
  const editFee = Math.max(0, parseInt(editDeliveryFee) || 0);
  const editGrandTotal = parsedEditLines.reduce((s, l) => s + l.price * l.quantity, 0) + editFee;

  const handleStatus = async (next: OrderStatus) => {
    setStatusLoading(next);
    try { await onStatusChange(order, next); onToast(`Status → ${SC[next].label}`); }
    finally { setStatusLoading(null); }
  };

  const handlePostexBook = async () => {
    setBookLoading(true); setBookError("");
    const courierNote = courierInstr==="open" ? OPEN_PARCEL_NOTE : courierInstr==="custom" ? customInstr.trim() : "";
    try {
      const r = await postexBook({ orderId:String(order.orderNumber ?? order.id), name:order.name, phone:order.phone,
        address:order.address ?? "", city:order.city, note:courierNote || undefined, ...postexParamsFor(order) });
      if (r.ok && r.trackingNumber) {
        await onUpdate(order.id, { trackingNumber:r.trackingNumber, courierName:"postex", courierNote:courierNote || undefined });
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
      let cancelledWithPostEx = false;
      if (order.courierName === "postex" && order.trackingNumber) {
        const r = await postexCancel(order.trackingNumber);
        cancelledWithPostEx = r.ok;
      }
      await onUpdate(order.id, {
        trackingNumber: undefined, courierName: undefined,
        postexStatus: undefined, postexLastSync: undefined, postexData: undefined,
      });
      await onStatusChange(order, "confirmed");
      setConfirmCancel(false);
      onToast(cancelledWithPostEx
        ? "Booking cancelled with PostEx"
        : "Local booking cleared — cancel on PostEx portal too");
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
    const valid = parsedEditLines.filter(l => l.variant && l.price > 0);
    if (valid.length === 0) return;
    setSavingOrder(true);
    try {
      const updates: Record<string, unknown> = {};
      if (valid.length === 1) {
        updates.productId   = valid[0].variant!.id;
        updates.productName = valid[0].variant!.name;
        updates.price       = valid[0].price;
        updates.quantity    = valid[0].quantity;
        // Clear any stale multi-item fields if this order previously had them.
        if (order.items && order.items.length > 0) {
          updates.items       = deleteField();
          updates.deliveryFee = deleteField();
        }
      } else {
        const newItems: OrderItem[] = valid.map(l => ({
          productId: l.variant!.id, productName: l.variant!.name, price: l.price, quantity: l.quantity,
        }));
        updates.productId   = newItems[0].productId;
        updates.productName = newItems[0].productName;
        updates.price       = newItems[0].price;
        updates.quantity    = newItems[0].quantity;
        updates.items       = newItems;
        updates.deliveryFee = editFee;
      }
      await onUpdate(order.id, updates as Partial<OrderData>);
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
            {/* Returning customer — expandable order history for this phone */}
            {dupPhone.length > 0 && (
              <div className="rounded-2xl border border-[#C9A84C]/30 bg-[#C9A84C]/[0.07] overflow-hidden">
                <button onClick={() => setShowHistory(v => !v)} className="w-full flex items-center gap-2.5 p-3.5 text-left">
                  <div className="w-7 h-7 rounded-full bg-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-3.5 h-3.5 text-[#9C7A2E]"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#9C7A2E]">Returning Customer</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{dupPhone.length} previous order{dupPhone.length>1?"s":""} with this phone number</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${showHistory ? "rotate-90" : ""}`}/>
                </button>
                {showHistory && (
                  <div className="divide-y divide-[#C9A84C]/15 border-t border-[#C9A84C]/20">
                    {dupPhone.slice(0,8).map(o => (
                      <div key={o.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{getOrderProductLabel(o)}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(o.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={o.status} size="sm"/>
                          <span className="text-xs font-bold text-gray-700">PKR {getOrderTotal(o).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  {getWAMsgs(order).map(m => {
                    const isOpen = waOpenKey === m.key;
                    const draft  = waDrafts[m.key] ?? m.text;
                    const edited = draft !== m.text;
                    return (
                      <div key={m.key} className="rounded-xl overflow-hidden">
                        <button onClick={()=>setWaOpenKey(isOpen ? null : m.key)}
                          className="w-full flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-xl transition-colors">
                          <MessageCircle className="w-3.5 h-3.5 flex-shrink-0"/>
                          <span className="flex-1 text-left">{m.label}{edited ? " · edited" : ""}</span>
                          <Edit2 className="w-3 h-3 text-green-500 flex-shrink-0"/>
                        </button>
                        {isOpen && (
                          <div className="bg-green-50/60 border border-green-100 rounded-xl mt-1.5 p-2.5 space-y-2">
                            <textarea value={draft} rows={6}
                              onChange={e=>setWaDrafts(d=>({ ...d, [m.key]: e.target.value }))}
                              className="admin-input py-2 resize-none font-mono text-[11px] leading-relaxed"/>
                            <div className="flex items-center gap-2">
                              <button onClick={()=>copy(draft, `wa-${m.key}`)}
                                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors">
                                {copied===`wa-${m.key}` ? <Check className="w-3.5 h-3.5 text-green-600"/> : <Copy className="w-3.5 h-3.5"/>}
                                {copied===`wa-${m.key}` ? "Copied!" : "Copy"}
                              </button>
                              <a href={waHrefWithText(order, draft)} target="_blank" rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-xl transition-colors">
                                <MessageCircle className="w-3.5 h-3.5"/> Send
                              </a>
                            </div>
                            {edited && (
                              <button onClick={()=>setWaDrafts(d=>{ const n={...d}; delete n[m.key]; return n; })}
                                className="text-[10px] text-gray-400 hover:text-gray-600 underline">
                                Reset to template
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                        className="admin-input py-2"/>
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Address</label>
                    <textarea value={editAddress} onChange={e=>setEditAddress(e.target.value)} rows={2}
                      className="admin-input py-2 resize-none"/>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Note</label>
                    <input value={editNote} onChange={e=>setEditNote(e.target.value)}
                      placeholder="Order note (optional)"
                      className="admin-input py-2"/>
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
              <div className="space-y-1.5">
                {items.map((it, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-gray-900">{it.productName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Qty {it.quantity} × PKR {it.price.toLocaleString()}</p>
                  </div>
                ))}
                {!!order.deliveryFee && (
                  <p className="text-xs text-gray-400">+ PKR {order.deliveryFee.toLocaleString()} delivery</p>
                )}
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
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Edit Order</p>
                    <button type="button" onClick={addEditLine}
                      className="text-xs font-bold text-[#C9A84C] hover:text-[#B8954A] flex items-center gap-1">
                      <Plus className="w-3 h-3"/> Add product
                    </button>
                  </div>
                  {editLines.map((l, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <select value={l.productId} onChange={e => setEditLineProduct(i, e.target.value)}
                          className="admin-input py-2 flex-1">
                          {allVariants.map(v => (
                            <option key={v.id} value={v.id}>{v.name} — PKR {v.price.toLocaleString()}</option>
                          ))}
                        </select>
                        {editLines.length > 1 && (
                          <button type="button" onClick={() => removeEditLine(i)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">Unit Price (PKR)</label>
                          <input type="number" min={0} value={l.price} onChange={e => updateEditLine(i, { price: e.target.value })}
                            className="admin-input py-2"/>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
                          <input type="number" min={1} value={l.quantity} onChange={e => updateEditLine(i, { quantity: e.target.value })}
                            className="admin-input py-2"/>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Delivery Fee (PKR)</label>
                    <input type="number" min={0} value={editDeliveryFee} onChange={e => setEditDeliveryFee(e.target.value)}
                      className="admin-input py-2"/>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    New COD total: PKR {editGrandTotal.toLocaleString()}
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
                        t.primary ? "bg-[#C9A84C] hover:bg-[#B8954A] text-white" :
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
                  {order.courierNote && (
                    <p className="text-xs text-gray-500 italic flex items-start gap-1.5">
                      <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"/> {order.courierNote}
                    </p>
                  )}
                  {/* Live PostEx status from auto-sync */}
                  {order.courierName === "postex" && order.postexStatus && (() => {
                    const ps = POSTEX_STATUS_STYLE[order.postexStatus] ?? { bg: "bg-gray-100", text: "text-gray-600" };
                    const syncDate = order.postexLastSync instanceof Date
                      ? order.postexLastSync
                      : (order.postexLastSync as unknown as { toDate?: () => Date })?.toDate?.();
                    return (
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ps.bg} ${ps.text}`}>
                          {order.postexStatus}
                        </span>
                        {syncDate && (
                          <p className="text-[10px] text-gray-400">{fmtDate(syncDate)}</p>
                        )}
                      </div>
                    );
                  })()}
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
                    {confirmCancel ? "Tap again to confirm — cancels with PostEx" : "Cancel Booking & Re-book"}
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
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-gray-500 uppercase">Courier instruction (sent as Notes to PostEx)</p>
                        <div className="flex rounded-xl bg-gray-200 p-0.5">
                          {([["none","None"],["open","Allow Open"],["custom","Custom"]] as const).map(([v,label]) => (
                            <button key={v} onClick={()=>setCourierInstr(v)}
                              className={`flex-1 text-xs font-bold py-1.5 rounded-[10px] transition-colors ${courierInstr===v?"bg-white text-gray-900 shadow-sm":"text-gray-500"}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                        {courierInstr==="custom" && (
                          <input value={customInstr} onChange={e=>setCustomInstr(e.target.value)}
                            placeholder="e.g. Call before delivery…" className="admin-input py-2 text-sm"/>
                        )}
                      </div>
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
                        className="admin-input py-2"/>
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
                  className="admin-input py-2 resize-none"/>
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
