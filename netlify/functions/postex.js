/**
 * PostEx API proxy — keeps the API token server-side.
 * All actions require a verified Firebase ID token since they create
 * real courier shipments or expose customer data.
 *
 * Supported actions (query param: ?action=...):
 *   book   — create a new shipment
 *   track  — get tracking status for a single CN
 *   cancel — cancel a shipment with PostEx
 */

const { createRemoteJWKSet, jwtVerify } = require("jose");

const BASE = "https://api.postex.pk/services/integration/api";
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://zaraar.shop";
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const HEADERS = () => ({
  "Content-Type": "application/json",
  token: process.env.POSTEX_API_TOKEN,
});

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

async function verifyAdmin(event) {
  const header = event.headers.authorization || event.headers.Authorization || "";
  const idToken = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!idToken || !PROJECT_ID) throw new Error("Missing token");
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });
  // A valid token only proves the caller is signed in — it says nothing
  // about who they are. Require the admin custom claim (set via
  // scripts/set-admin-claim.js) so any logged-in Firebase user can't book,
  // track or cancel courier shipments.
  if (payload.admin !== true) throw new Error("Not an admin");
}

exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": SITE_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  const token = process.env.POSTEX_API_TOKEN;
  if (!token) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: "Missing POSTEX_API_TOKEN" }) };
  }

  try {
    await verifyAdmin(event);
  } catch {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ ok: false, error: "Unauthorized" }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ ok: false, error: "POST required" }) };
  }

  const params = event.queryStringParameters || {};
  const action = params.action;

  // ── track ──────────────────────────────────────────────────────────────────
  if (action === "track") {
    try {
      const { trackingNumber } = JSON.parse(event.body);
      if (!trackingNumber) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "trackingNumber required" }) };
      }
      const res = await fetch(`${BASE}/order/v1/track-order/${encodeURIComponent(trackingNumber)}`, {
        headers: HEADERS(),
      });
      const data = await res.json();
      const tracking = data?.dist;
      if (!tracking) {
        return { statusCode: 404, headers: cors, body: JSON.stringify({ ok: false, error: "Order not found" }) };
      }
      return {
        statusCode: 200,
        headers: cors,
        body: JSON.stringify({ ok: true, tracking }),
      };
    } catch (err) {
      console.error("postex track error:", err);
      return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: String(err) }) };
    }
  }

  // ── cancel ─────────────────────────────────────────────────────────────────
  if (action === "cancel") {
    try {
      const { trackingNumber } = JSON.parse(event.body);
      if (!trackingNumber) {
        return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "trackingNumber required" }) };
      }
      const res = await fetch(`${BASE}/order/v1/cancel-order`, {
        method: "PUT",
        headers: HEADERS(),
        body: JSON.stringify({ trackingNumber }),
      });
      const ok = res.status === 200;
      return {
        statusCode: 200,
        headers: cors,
        body: JSON.stringify({ ok, error: ok ? undefined : `PostEx returned HTTP ${res.status}` }),
      };
    } catch (err) {
      console.error("postex cancel error:", err);
      return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: String(err) }) };
    }
  }

  // ── book ───────────────────────────────────────────────────────────────────
  if (action !== "book") {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: `Unsupported action: ${action}` }) };
  }

  try {
    const order = JSON.parse(event.body);

    // Resolve pickup address code from env var (set this once via Netlify dashboard
    // or: netlify env:set POSTEX_PICKUP_ADDRESS_CODE "your-code").
    // Fall back to calling the PostEx API to discover it automatically.
    let pickupAddressCode = process.env.POSTEX_PICKUP_ADDRESS_CODE || order.pickupAddressCode || "";

    if (!pickupAddressCode) {
      try {
        const addrRes = await fetch(`${BASE}/order/v1/get-merchant-address`, { headers: HEADERS() });
        if (addrRes.ok) {
          const addrData = await addrRes.json();
          const first = Array.isArray(addrData?.dist) ? addrData.dist[0] : null;
          pickupAddressCode = first?.addressCode || "";
          if (pickupAddressCode) console.log("Auto-resolved pickup address code:", pickupAddressCode);
        }
      } catch (e) {
        console.error("Failed to fetch pickup address:", e);
      }
    }

    if (!pickupAddressCode) {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({
          ok: false,
          error: "PostEx pickup address code not found. Set POSTEX_PICKUP_ADDRESS_CODE env var — get the code from your PostEx merchant portal under Addresses.",
        }),
      };
    }

    const total = order.price * order.quantity;
    const payload = {
      cityName:          order.city.trim(),
      customerName:      order.name.trim(),
      customerPhone:     order.phone.trim(),
      deliveryAddress:   order.address.trim(),
      invoiceDivision:   1,
      invoicePayment:    total,
      items:             String(order.pieces || order.quantity),
      orderDetail:       order.productName.replace(/[—–]/g, "-").trim(),
      orderRefNumber:    order.orderId,
      orderType:         "Normal",
      pickupAddressCode,
      ...(order.note && order.note.trim() ? { transactionNotes: order.note.trim() } : {}),
    };

    // Payload/response contain customer name, phone and address — only log
    // them when explicitly debugging locally, never in production logs.
    if (process.env.DEBUG_LOGGING === "true") {
      console.log("PostEx book payload:", JSON.stringify(payload));
    }
    const res = await fetch(`${BASE}/order/v3/create-order`, {
      method: "POST",
      headers: HEADERS(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (process.env.DEBUG_LOGGING === "true") {
      console.log("PostEx book response:", JSON.stringify(data));
    }

    const postexMsg      = data?.message || data?.dist?.message || data?.error || null;
    const trackingNumber = data?.dist?.trackingNumber || data?.trackingNumber;
    const ok             = !!trackingNumber;

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        ok,
        data,
        trackingNumber,
        error: ok ? undefined : (postexMsg || `PostEx error (HTTP ${res.status})`),
      }),
    };

  } catch (err) {
    console.error("postex function error:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: String(err) }) };
  }
};
