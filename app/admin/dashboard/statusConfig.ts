import { OrderStatus } from "@/lib/orders";

// ─── Status config ────────────────────────────────────────────────────────────
export const POSTEX_STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "Delivered":                    { bg: "bg-green-100",  text: "text-green-700"  },
  "Out For Delivery":             { bg: "bg-sky-100",    text: "text-sky-700"    },
  "Booked":                       { bg: "bg-indigo-100", text: "text-indigo-700" },
  "Picked By PostEx":             { bg: "bg-indigo-100", text: "text-indigo-700" },
  "PostEx WareHouse":             { bg: "bg-indigo-100", text: "text-indigo-700" },
  "En-Route to PostEx warehouse": { bg: "bg-indigo-100", text: "text-indigo-700" },
  "Attempted":                    { bg: "bg-orange-100", text: "text-orange-700" },
  "Delivery Under Review":        { bg: "bg-orange-100", text: "text-orange-700" },
  "Out For Return":               { bg: "bg-rose-100",   text: "text-rose-700"   },
  "Returned":                     { bg: "bg-purple-100", text: "text-purple-700" },
  "Expired":                      { bg: "bg-red-100",    text: "text-red-700"    },
};

export const SC: Record<OrderStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  pending:           { label: "Pending",            bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-400"  },
  confirmed:         { label: "Confirmed",          bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500"   },
  dispatched:        { label: "Dispatched",         bg: "bg-indigo-50",  text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
  in_transit:        { label: "In Transit",         bg: "bg-sky-50",     text: "text-sky-700",    border: "border-sky-200",    dot: "bg-sky-500"    },
  delivered:         { label: "Delivered",          bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200",  dot: "bg-green-500"  },
  failed_delivery:   { label: "Failed Delivery",    bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  return_in_transit: { label: "Return in Transit",  bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-200",   dot: "bg-rose-500"   },
  returned:          { label: "Return Received",    bg: "bg-purple-50",  text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
  cancelled:         { label: "Cancelled",          bg: "bg-red-50",     text: "text-red-600",    border: "border-red-200",    dot: "bg-red-500"    },
};

export const TRANS: Record<OrderStatus, { next: OrderStatus; label: string; primary?: boolean; danger?: boolean }[]> = {
  pending:           [{ next: "confirmed",          label: "Confirm Order",      primary: true }, { next: "cancelled",          label: "Cancel",            danger: true }],
  confirmed:         [{ next: "dispatched",         label: "Mark Dispatched",    primary: true }, { next: "cancelled",          label: "Cancel",            danger: true }, { next: "pending", label: "Revert" }],
  dispatched:        [{ next: "in_transit",         label: "In Transit",         primary: true }, { next: "confirmed",          label: "Revert" }],
  in_transit:        [{ next: "delivered",          label: "Mark Delivered",     primary: true }, { next: "failed_delivery",    label: "Failed Delivery",   danger: true }],
  delivered:         [{ next: "return_in_transit",  label: "Return in Transit",  danger: true  }, { next: "in_transit",         label: "Revert" }],
  failed_delivery:   [{ next: "in_transit",         label: "Retry Delivery",     primary: true }, { next: "return_in_transit",  label: "Return to Origin",  danger: true }],
  return_in_transit: [{ next: "returned",           label: "Return Received",    primary: true }, { next: "in_transit",         label: "Retry Delivery" }],
  returned:          [{ next: "pending",            label: "Reopen Order",       primary: true }],
  cancelled:         [{ next: "pending",            label: "Reopen Order",       primary: true }],
};
