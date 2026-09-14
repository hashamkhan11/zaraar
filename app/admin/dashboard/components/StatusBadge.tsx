import { OrderStatus } from "@/lib/orders";
import { SC } from "../statusConfig";

export function StatusBadge({ status, size = "md" }: { status: OrderStatus; size?: "sm" | "md" }) {
  const s = SC[status]; if (!s) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${s.bg} ${s.text} ${s.border} ${size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}
