/**
 * Public order creation — the only place a storefront order is written.
 *
 * The client sends a productId + quantity + customer details. The price is
 * NEVER taken from the client: it is looked up here from the catalog
 * (data/products.ts, the same bundled data the storefront renders from) and
 * the total is computed server-side before writing to Firestore with the
 * Admin SDK. This closes the price-tampering hole where a customer (or
 * anyone hitting Firestore directly) could previously set an arbitrary
 * `price`/`total` that became the literal COD amount handed to the courier.
 *
 * Requires the same FIREBASE_SERVICE_ACCOUNT env var as postex-sync.js.
 */

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue }      = require("firebase-admin/firestore");
const { computeOrderPricing }           = require("../../lib/pricing");

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://zaraar.shop";

if (!getApps().length) {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (sa) {
    initializeApp({ credential: cert(JSON.parse(sa)) });
  } else {
    console.error("FIREBASE_SERVICE_ACCOUNT env var is missing — create-order cannot run");
  }
}

const MAX_QUANTITY = 20;

// Mirrors normalizePhone() in lib/orders.ts — kept local since this function
// runs outside the Next.js bundle.
function normalizePhone(phone) {
  const d = String(phone).replace(/\D/g, "");
  if (d.startsWith("92") && d.length >= 12) return "0" + d.slice(2);
  return d;
}

function isNonEmptyString(v, maxLen) {
  return typeof v === "string" && v.trim().length > 0 && v.trim().length < maxLen;
}

async function getNextOrderNumber(db) {
  const counterRef = db.collection("meta").doc("orderCounter");
  return db.runTransaction(async (t) => {
    const snap = await t.get(counterRef);
    const next = snap.exists ? (snap.data().value || 0) + 1 : 1001;
    t.set(counterRef, { value: next });
    return next;
  });
}

exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": SITE_ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ ok: false, error: "POST required" }) };
  }
  if (!getApps().length) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: "Server not configured" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "Invalid JSON body" }) };
  }

  const { productId, quantity, name, phone, city, address, note } = body;

  const qty = Number.isInteger(quantity) ? quantity : 1;
  if (qty < 1 || qty > MAX_QUANTITY) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "Invalid quantity" }) };
  }
  if (!isNonEmptyString(name, 120) || !isNonEmptyString(city, 80) || !isNonEmptyString(address, 500)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "Missing or invalid customer details" }) };
  }
  const normalizedPhone = normalizePhone(phone);
  if (!/^03\d{9}$/.test(normalizedPhone)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "Invalid phone number" }) };
  }

  // ── Authoritative price — computed here, never trusted from the client ─────
  let pricing;
  try {
    pricing = computeOrderPricing(productId, qty);
  } catch (err) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: err.message }) };
  }
  const { product, price, deliveryFee, total } = pricing;

  try {
    const db = getFirestore();
    const orderNumber = await getNextOrderNumber(db);

    const productName = `${product.name} | ${product.seriesName}`;

    const payload = Object.fromEntries(
      Object.entries({
        orderNumber,
        name: name.trim(),
        phone: normalizedPhone,
        city: city.trim(),
        address: address.trim(),
        // Legacy single-product fields (mirror items[0]) so any code that
        // reads productId/productName/price/quantity directly still works —
        // see the OrderData comment in lib/orders.ts.
        productId: product.id,
        productName,
        price,
        quantity: qty,
        // Source of truth for the total: getOrderTotal() sums items[].price *
        // items[].quantity and adds deliveryFee on top (flat, not per unit).
        items: [{ productId: product.id, productName, price, quantity: qty }],
        deliveryFee,
        note: typeof note === "string" && note.trim() ? note.trim() : undefined,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
      }).filter(([, v]) => v !== undefined)
    );

    const docRef = await db.collection("orders").add(payload);

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({ ok: true, orderId: docRef.id, orderNumber, total }),
    };
  } catch (err) {
    console.error("create-order error:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: "Failed to create order" }) };
  }
};
