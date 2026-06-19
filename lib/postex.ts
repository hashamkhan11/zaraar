// Client-side PostEx helper — booking only. All other PostEx actions (track,
// cancel, etc.) were removed from the server proxy since they were reachable
// by anyone, leaking customer PII and allowing booking abuse without auth.

import { auth } from "@/lib/firebase";

const API = "/.netlify/functions/postex";

export async function postexBook(order: {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  productName: string;
  price: number;
  quantity: number;
}): Promise<{ ok: boolean; trackingNumber?: string; error?: string; raw?: unknown }> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) {
    return { ok: false, error: "Not signed in" };
  }

  const res = await fetch(`${API}?action=book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(order),
  });
  const json = await res.json();
  return { ok: json.ok, trackingNumber: json.trackingNumber, error: json.error, raw: json.data };
}
