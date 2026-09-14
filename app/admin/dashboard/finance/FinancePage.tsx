import { useState } from "react";
import { Loader2, Plus, Trash2, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  calcPL, Expense, ExpenseData, ExpenseType,
  EXPENSE_LABELS, EXPENSE_IS_INCOME, EXPENSE_COLORS,
} from "@/lib/finance";

export function FinancePage({ expenses, onAdd, onDelete }: {
  expenses: Expense[];
  onAdd:    (data: ExpenseData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [type, setType]   = useState<ExpenseType>("stock");
  const [amount, setAmount] = useState("");
  const [note, setNote]   = useState("");
  const [date, setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string|null>(null);
  const [confirmDel, setConfirmDel] = useState<string|null>(null);

  const todayStr      = new Date().toISOString().slice(0, 10);
  const monthStart    = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const todayExp  = expenses.filter(e => e.date === todayStr);
  const monthExp  = expenses.filter(e => e.date >= monthStartStr);

  const today = calcPL(todayExp);
  const month = calcPL(monthExp);

  const handleAdd = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    setSaving(true);
    try {
      await onAdd({ type, amount: amt, note: note.trim() || undefined, date });
      setAmount(""); setNote("");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirmDel !== id) { setConfirmDel(id); return; }
    setDeleting(id);
    try { await onDelete(id); } finally { setDeleting(null); setConfirmDel(null); }
  };

  function PLCard({ title, pl }: { title: string; pl: ReturnType<typeof calcPL> }) {
    const isProfit = pl.net >= 0;
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          <div className={`flex items-center gap-1 text-sm font-extrabold ${isProfit?"text-green-600":"text-red-600"}`}>
            {isProfit ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4"/>}
            PKR {Math.abs(pl.net).toLocaleString()}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Courier Received</span>
            <span className="font-semibold text-green-700">+ PKR {pl.income.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total Costs</span>
            <span className="font-semibold text-red-600">− PKR {pl.costs.toLocaleString()}</span>
          </div>
          {pl.byType.filter(b => !EXPENSE_IS_INCOME[b.type] && b.total > 0).map(b => (
            <div key={b.type} className="flex justify-between text-[11px] text-gray-400 pl-3">
              <span>{EXPENSE_LABELS[b.type]}</span>
              <span>PKR {b.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className={`flex items-center justify-between pt-3 border-t border-gray-100 font-bold text-sm ${isProfit?"text-green-700":"text-red-600"}`}>
          <span>Net {isProfit ? "Profit" : "Loss"}</span>
          <span>PKR {Math.abs(pl.net).toLocaleString()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 max-w-5xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Finance</h2>
        <p className="text-xs text-gray-400 mt-0.5">Track expenses and courier payments — see your real P&L</p>
      </div>

      {/* P&L cards — today + this month */}
      <div className="grid md:grid-cols-2 gap-4">
        <PLCard title="Today" pl={today}/>
        <PLCard title="This Month" pl={month}/>
      </div>

      {/* Add entry */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Log Entry</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div className="col-span-2">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Category</label>
            <select value={type} onChange={e => setType(e.target.value as ExpenseType)}
              className="admin-input">
              {(Object.keys(EXPENSE_LABELS) as ExpenseType[]).map(t => (
                <option key={t} value={t}>
                  {EXPENSE_IS_INCOME[t] ? "↑ " : "↓ "}{EXPENSE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Amount (PKR)</label>
            <input type="number" min={1} placeholder="5000"
              value={amount} onChange={e => setAmount(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
              className="admin-input"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Date</label>
            <input type="date" max={todayStr}
              value={date} onChange={e => setDate(e.target.value)}
              className="admin-input"/>
          </div>
        </div>
        <div className="flex gap-3">
          <input type="text" placeholder="Note (optional)…"
            value={note} onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
            className="admin-input flex-1"/>
          <button disabled={saving || !amount || parseFloat(amount) <= 0} onClick={handleAdd}
            className="text-sm font-bold bg-[#C9A84C] hover:bg-[#B8954A] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>} Add
          </button>
        </div>
      </div>

      {/* Expense log */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Log</h3>
          <span className="text-xs text-gray-400">{expenses.length} entries</span>
        </div>
        {expenses.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center gap-2">
            <DollarSign className="w-6 h-6 text-gray-300"/> No entries yet
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {expenses.map(e => {
              const isIncome = EXPENSE_IS_INCOME[e.type];
              return (
                <div key={e.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${EXPENSE_COLORS[e.type]}`}>
                    {EXPENSE_LABELS[e.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    {e.note && <p className="text-sm text-gray-700 truncate">{e.note}</p>}
                    <p className="text-xs text-gray-400">{e.date}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${isIncome?"text-green-700":"text-gray-900"}`}>
                    {isIncome ? "+" : "−"} PKR {e.amount.toLocaleString()}
                  </span>
                  <button
                    disabled={!!deleting}
                    onClick={() => handleDelete(e.id)}
                    className={`p-1.5 rounded-lg flex-shrink-0 transition-colors disabled:opacity-40 ${
                      confirmDel === e.id
                        ? "bg-red-500 text-white"
                        : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                    }`}
                    title={confirmDel === e.id ? "Tap again to confirm" : "Delete"}>
                    {deleting === e.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5"/>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
