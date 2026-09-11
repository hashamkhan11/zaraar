/**
 * Public PostEx tracking endpoint — no authentication required.
 * Returns only sanitized shipment data (no financial amounts, no merchant info).
 *
 * GET /.netlify/functions/postex-track?cn=CX-XXXXXXXXXXX
 * GET /.netlify/functions/postex-track?phone=03001234567
 */

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

if (!getApps().length) {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (sa) initializeApp({ credential: cert(JSON.parse(sa)) });
}

const BASE = "https://api.postex.pk/services/integration/api";

const STATUS_LABEL = {
  "0001": "At Merchant's Warehouse",
  "0002": "Returned",
  "0003": "At PostEx Warehouse",
  "0004": "Package on Route",
  "0005": "Delivered",
  "0006": "Returned",
  "0007": "Returned",
  "0008": "Delivery Under Review",
  "0013": "Delivery Attempted",
};

const ORDER_STATUS_LABEL = {
  pending:            "Pending",
  confirmed:          "Confirmed",
  dispatched:         "Dispatched",
  in_transit:         "In Transit",
  delivered:          "Delivered",
  failed_delivery:    "Delivery Attempted",
  return_in_transit:  "Return In Transit",
  returned:           "Returned",
  cancelled:          "Cancelled",
};

function normalizePhone(phone) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("92") && d.length >= 12) return "0" + d.slice(2);
  return d;
}

async function trackByCn(cn, cors) {
  if (!cn || cn.length < 5 || cn.length > 30 || /[^\w\-]/.test(cn)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "Invalid tracking number" }) };
  }

  const token = process.env.POSTEX_API_TOKEN;
  if (!token) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: "Service unavailable" }) };
  }

  try {
    const res = await fetch(`${BASE}/order/v1/track-order/${encodeURIComponent(cn)}`, {
      headers: { "Content-Type": "application/json", token },
    });
    const data = await res.json();
    const tracking = data?.dist;

    if (!tracking || data?.statusCode === "404") {
      return {
        statusCode: 404,
        headers: cors,
        body: JSON.stringify({ ok: false, error: "Order not found. Check your tracking number and try again." }),
      };
    }

    // Sanitize: strip financial amounts and customer PII before returning
    const history = (tracking.transactionStatusHistory || []).map(h => ({
      message: STATUS_LABEL[h.transactionStatusMessageCode] || h.transactionStatusMessage || "",
      code:    h.transactionStatusMessageCode || "",
    }));

    return {
      statusCode: 200,
      headers: { ...cors, "Cache-Control": "no-store" },
      body: JSON.stringify({
        ok:             true,
        trackingNumber: tracking.trackingNumber || cn,
        status:         tracking.transactionStatus || "",
        cityName:       tracking.cityName || "",
        orderDetail:    tracking.orderDetail || "",
        history,
      }),
    };
  } catch (err) {
    console.error("postex-track error:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: "Unable to fetch tracking info" }) };
  }
}

async function trackByPhone(phone, cors) {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 11 || !normalized.startsWith("0")) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "Enter a valid 11-digit phone number." }) };
  }
  if (!getApps().length) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: "Service unavailable" }) };
  }

  try {
    const db = getFirestore();
    const snap = await db.collection("orders").where("phone", "==", normalized).get();

    const orders = snap.docs
      .map(d => d.data())
      .filter(o => o.courierName === "postex" && !!o.trackingNumber)
      .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))
      .slice(0, 10)
      .map(o => ({
        trackingNumber: o.trackingNumber,
        productName:    o.productName || "",
        status:         ORDER_STATUS_LABEL[o.status] || o.status || "",
        createdAt:      o.createdAt?.toDate?.()?.toISOString() ?? null,
      }));

    if (orders.length === 0) {
      return {
        statusCode: 404,
        headers: cors,
        body: JSON.stringify({ ok: false, error: "No dispatched orders found for this phone number." }),
      };
    }

    return {
      statusCode: 200,
      headers: { ...cors, "Cache-Control": "no-store" },
      body: JSON.stringify({ ok: true, orders }),
    };
  } catch (err) {
    console.error("postex-track phone lookup error:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: "Unable to look up orders" }) };
  }
}

exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ ok: false, error: "GET required" }) };
  }

  const cn    = (event.queryStringParameters?.cn || "").trim();
  const phone = (event.queryStringParameters?.phone || "").trim();

  if (phone) return trackByPhone(phone, cors);
  if (cn)    return trackByCn(cn, cors);

  return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "Provide a tracking number or phone number" }) };
};
