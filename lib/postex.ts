// Client-side PostEx helpers — all actions proxy through Netlify functions
// so the API token never touches the browser. All actions require admin auth.

import { auth } from "@/lib/firebase";

const API = "/.netlify/functions/postex";

async function authPost(action: string, body: unknown) {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) return { ok: false as const, error: "Not signed in" };
  const res = await fetch(`${API}?action=${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function postexBook(order: {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  productName: string;
  price: number;
  quantity: number;
  /** Real number of physical pieces in the parcel, if different from `quantity`
   *  (used for multi-product orders where `price`/`quantity` are collapsed to a
   *  single COD amount but PostEx still wants the true piece count). */
  pieces?: number;
  /** Forwarded to PostEx as `transactionNotes` — instructions for the rider
   *  (e.g. "allow customer to open parcel before payment"). */
  note?: string;
}): Promise<{ ok: boolean; trackingNumber?: string; error?: string; raw?: unknown }> {
  const json = await authPost("book", order);
  return { ok: json.ok, trackingNumber: json.trackingNumber, error: json.error, raw: json.data };
}

export async function postexTrack(
  trackingNumber: string,
): Promise<{ ok: boolean; tracking?: Record<string, unknown>; error?: string }> {
  const json = await authPost("track", { trackingNumber });
  return { ok: json.ok, tracking: json.tracking, error: json.error };
}

export async function postexCancel(
  trackingNumber: string,
): Promise<{ ok: boolean; error?: string }> {
  const json = await authPost("cancel", { trackingNumber });
  return { ok: json.ok, error: json.error };
}
