import { useState } from "react";
import { Loader2, X, Edit2 } from "lucide-react";
import { StockMap } from "@/lib/stock";
import { allVariants } from "../utils";

export function InventoryPage({ stock, onSave }: { stock: StockMap; onSave: (id: string, val: number) => Promise<void> }) {
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
                      className="admin-input w-20 py-1.5 text-center"/>
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
