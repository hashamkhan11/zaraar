import type { ReactNode } from "react";

export function KpiCard({ label, value, sub, icon, accent }: {
  label: string; value: string; sub?: string; icon: ReactNode; accent?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 ${accent ? "border-[#C9A84C]/40 ring-1 ring-[#C9A84C]/20" : "border-gray-100"}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <span className={`p-2 rounded-xl ${accent ? "bg-[#C9A84C]/10 text-[#C9A84C]" : "bg-gray-100 text-gray-500"}`}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
