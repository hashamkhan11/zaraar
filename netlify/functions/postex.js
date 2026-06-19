/**
 * PostEx API proxy — keeps the API token server-side.
 * Scoped to a single action (book) and requires a verified Firebase ID
 * token, since this creates real, billable courier shipments.
 */

const { createRemoteJWKSet, jwtVerify } = require("jose");

const BASE = "https://api.postex.pk/services/integration/api";
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://zaraar.pk";
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
  await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });
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

  const params = event.queryStringParameters || {};
  if (params.action !== "book") {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: `Unsupported action: ${params.action}` }) };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ ok: false, error: "POST required" }) };
  }

  try {
    const order = JSON.parse(event.body);

    // Resolve pickup address code:
    // 1. Use env var if set (most reliable — set via: netlify env:set POSTEX_PICKUP_ADDRESS_CODE "your-code")
    // 2. Use code passed directly in the request body
    // 3. Try to fetch from PostEx API
    let pickupAddressCode = process.env.POSTEX_PICKUP_ADDRESS_CODE || order.pickupAddressCode || "";

    if (!pickupAddressCode) {
      // Try several known endpoint variations
      const addrEndpoints = [
        `${BASE}/order/v1/getPickupAddress`,
        `${BASE}/order/v1/merchant-pickup-addresses`,
        `${BASE}/merchant/v1/pickup-addresses`,
      ];
      for (const endpoint of addrEndpoints) {
        try {
          const addrRes = await fetch(endpoint, { headers: HEADERS() });
          if (addrRes.ok) {
            const addrData = await addrRes.json();
            const addresses = addrData?.dist || addrData?.data || addrData;
            const first = Array.isArray(addresses) ? addresses[0] : null;
            pickupAddressCode = first?.pickupAddressCode || first?.code || first?.addressCode || first?.pickupCode || "";
            console.log(`Pickup addresses from ${endpoint}:`, JSON.stringify(addrData));
            if (pickupAddressCode) break;
          }
        } catch (e) {
          console.error(`Failed ${endpoint}:`, e);
        }
      }
    }

    if (!pickupAddressCode) {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({
          ok: false,
          error: "PostEx pickup address code not found. Set POSTEX_PICKUP_ADDRESS_CODE env var — get the code from your PostEx merchant portal under Addresses/Settings.",
        }),
      };
    }

    const total = order.price * order.quantity;
    const payload = {
      cityName: order.city.trim(),
      customerName: order.name.trim(),
      customerPhone: order.phone.trim(),
      deliveryAddress: order.address.trim(),
      invoiceDivision: 1,
      invoicePayment: total,           // number, not string
      items: String(order.quantity),   // string per PostEx docs
      orderDetail: order.productName.replace(/[—–]/g, "-").trim(),
      orderRefNumber: order.orderId,
      orderType: "Normal",
      pickupAddressCode,
    };

    console.log("PostEx book payload:", JSON.stringify(payload));
    const res = await fetch(`${BASE}/order/v3/create-order`, {
      method: "POST",
      headers: HEADERS(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log("PostEx book response:", JSON.stringify(data));

    // Extract error message from PostEx response for better debugging
    const postexMsg = data?.message || data?.dist?.message || data?.error || null;
    const trackingNumber = data?.dist?.trackingNumber || data?.trackingNumber;
    const ok = !!trackingNumber;

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
