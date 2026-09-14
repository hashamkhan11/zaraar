import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { createOrder, OrderItem } from "@/lib/orders";
import { DELIVERY_FEE } from "@/data/products";
import { allVariants } from "../utils";

export function CreateOrderPanel({ open, onClose, onToast }: {
  open: boolean; onClose: () => void; onToast: (msg: string) => void;
}) {
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [city, setCity]       = useState("");
  const [address, setAddress] = useState("");
  const [lines, setLines]     = useState<{ productId: string; price: string; quantity: string }[]>(() => [makeLine()]);
  const [deliveryFee, setDeliveryFee] = useState(String(DELIVERY_FEE));
  const [note, setNote]       = useState("");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  function makeLine() {
    const v = allVariants[0];
    return { productId: v?.id ?? "", price: String(v?.price ?? ""), quantity: "1" };
  }

  const reset = () => {
    setName(""); setPhone(""); setCity(""); setAddress("");
    setLines([makeLine()]); setDeliveryFee(String(DELIVERY_FEE)); setNote(""); setError("");
  };

  useEffect(() => { if (!open) reset(); }, [open]);

  const updateLine = (i: number, patch: Partial<{ productId: string; price: string; quantity: string }>) => {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  };
  // Switching the product resets the line's price to that product's catalog
  // price — admin can then edit it down for a bulk/discounted order.
  const setLineProduct = (i: number, productId: string) => {
    const v = allVariants.find(v => v.id === productId);
    updateLine(i, { productId, price: String(v?.price ?? "") });
  };
  const addLine = () => setLines(prev => [...prev, makeLine()]);
  const removeLine = (i: number) => setLines(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev);

  const parsedLines = lines.map(l => ({
    variant: allVariants.find(v => v.id === l.productId),
    price: parseFloat(l.price) || 0,
    quantity: Math.max(1, parseInt(l.quantity) || 1),
  }));
  const linesTotal = parsedLines.reduce((s, l) => s + l.price * l.quantity, 0);
  const fee = Math.max(0, parseInt(deliveryFee) || 0);
  const grandTotal = linesTotal + fee;

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !city.trim() || !address.trim() || parsedLines.some(l => !l.variant || l.price <= 0)) {
      setError("Name, phone, city, address and a valid product/price for every line are required."); return;
    }
    setSaving(true); setError("");
    try {
      if (parsedLines.length === 1) {
        const l = parsedLines[0];
        // Single product — keep the exact legacy shape (delivery fee baked into
        // price, no items[]/deliveryFee fields) so every existing read path
        // keeps working unchanged.
        const finalPrice = Math.round(l.price + fee / l.quantity);
        await createOrder({
          name: name.trim(), phone: phone.trim(), city: city.trim(),
          address: address.trim(), note: note.trim() || undefined,
          productId: l.variant!.id, productName: l.variant!.name,
          price: finalPrice, quantity: l.quantity,
          paymentStatus: "pending",
        });
      } else {
        const items: OrderItem[] = parsedLines.map(l => ({
          productId: l.variant!.id, productName: l.variant!.name, price: l.price, quantity: l.quantity,
        }));
        await createOrder({
          name: name.trim(), phone: phone.trim(), city: city.trim(),
          address: address.trim(), note: note.trim() || undefined,
          productId: items[0].productId, productName: items[0].productName,
          price: items[0].price, quantity: items[0].quantity,
          items, deliveryFee: fee,
          paymentStatus: "pending",
        });
      }
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
                className="admin-input"/>
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Address</label>
            <textarea value={address} onChange={e=>setAddress(e.target.value)} rows={2} placeholder="Full delivery address"
              className="admin-input resize-none"/>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-600">Products</label>
              <button type="button" onClick={addLine}
                className="text-xs font-bold text-[#C9A84C] hover:text-[#B8954A] flex items-center gap-1">
                <Plus className="w-3 h-3"/> Add product
              </button>
            </div>
            <div className="space-y-3">
              {lines.map((l, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <select value={l.productId} onChange={e=>setLineProduct(i, e.target.value)}
                      className="admin-input flex-1">
                      {allVariants.map(v => <option key={v.id} value={v.id}>{v.name} — PKR {v.price.toLocaleString()}</option>)}
                    </select>
                    {lines.length > 1 && (
                      <button type="button" onClick={()=>removeLine(i)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Unit Price (PKR)</label>
                      <input type="number" min={0} value={l.price} onChange={e=>updateLine(i,{price:e.target.value})}
                        className="admin-input"/>
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Qty</label>
                      <input type="number" min={1} value={l.quantity} onChange={e=>updateLine(i,{quantity:e.target.value})}
                        className="admin-input"/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Delivery Fee (PKR)</label>
            <input type="number" min={0} value={deliveryFee} onChange={e=>setDeliveryFee(e.target.value)}
              className="admin-input"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Note (optional)</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Any special instructions"
              className="admin-input"/>
          </div>
          {parsedLines.some(l => l.variant) && (
            <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#C9A84C] mb-1">Order Summary</p>
              <div className="space-y-0.5">
                {parsedLines.map((l, i) => l.variant && (
                  <p key={i} className="text-sm text-gray-700">
                    {l.quantity} × {l.variant.name} @ PKR {l.price.toLocaleString()}
                  </p>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1.5">
                + PKR {fee.toLocaleString()} delivery = <span className="font-bold">PKR {grandTotal.toLocaleString()}</span>
              </p>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-gray-100 flex-shrink-0">
          <button disabled={saving} onClick={handleSubmit}
            className="w-full text-sm font-bold bg-[#C9A84C] hover:bg-[#B8954A] text-white py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>} Create Order
          </button>
        </div>
      </div>
    </>
  );
}
