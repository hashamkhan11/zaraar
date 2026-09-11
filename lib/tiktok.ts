declare global {
  interface Window {
    ttq?: { page: () => void; track: (event: string, props: Record<string, unknown>) => void };
  }
}

export async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str.trim().toLowerCase()));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getTtclid(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("ttclid") || "";
}

function getTtp(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)_ttp=([^;]+)/);
  return match ? match[1] : "";
}

// TikTok's Events API only recognizes the plural "content_ids" (array) and a
// "contents" array for commerce events (AddToCart/Purchase) — a flat
// singular "content_id" is silently ignored, which is what was tripping the
// "Content ID is missing" pixel diagnostic. Derive both from the existing
// flat fields so every call site stays unchanged.
function normalizeCommerceProps(properties: Record<string, unknown>): Record<string, unknown> {
  const contentId = properties.content_id;
  if (typeof contentId !== "string" || !contentId.trim()) return properties;

  return {
    ...properties,
    content_ids: [contentId],
    contents: [
      {
        content_id: contentId,
        content_type: properties.content_type ?? "product",
        content_name: properties.content_name,
        price: properties.value,
      },
    ],
  };
}

export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown>,
  userData?: { phone?: string; external_id?: string }
) {
  const eventId = crypto.randomUUID();
  const normalizedProps = normalizeCommerceProps(properties);

  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track(eventName, { ...normalizedProps, event_id: eventId });
  }

  try {
    fetch("/.netlify/functions/tiktok-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: eventName,
        event_id: eventId,
        properties: normalizedProps,
        user: {
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          ttclid: getTtclid(),
          ttp: getTtp(),
          ...userData,
        },
        url: typeof window !== "undefined" ? window.location.href : "",
      }),
    }).catch(() => {});
  } catch {}
}

// Fire only the CAPI (server-side via Netlify) — call before a page redirect so
// the event is delivered even if the user closes the tab before the thank-you page loads.
export function capiFirePurchase(
  eventId: string,
  properties: Record<string, unknown>,
  userData?: { phone?: string },
) {
  const normalizedProps = normalizeCommerceProps(properties);
  fetch("/.netlify/functions/tiktok-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "Purchase",
      event_id: eventId,
      properties: normalizedProps,
      user: {
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        ttclid: getTtclid(),
        ttp: getTtp(),
        ...userData,
      },
      url: typeof window !== "undefined" ? window.location.href : "",
    }),
  }).catch(() => {});
}

// Fire only the browser pixel — call on the thank-you page, paired with
// capiFirePurchase from the order form, sharing the same eventId for deduplication.
export function pixelFirePurchase(
  eventId: string,
  properties: Record<string, unknown>,
) {
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track("Purchase", {
      ...normalizeCommerceProps(properties),
      event_id: eventId,
    });
  }
}
