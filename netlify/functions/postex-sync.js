/**
 * Scheduled PostEx sync — runs every 30 minutes via netlify.toml.
 *
 * What it does:
 * 1. Reads all active PostEx orders (dispatched / in_transit) from Firestore
 * 2. Calls PostEx track API for each and updates postexStatus in Firestore
 * 3. Auto-advances the ZARAAR order status when PostEx confirms delivery,
 *    return, etc.
 * 4. Checks payment settlement (settle: true) for delivered orders and
 *    marks paymentStatus: "paid" automatically.
 *
 * Requires env vars:
 *   POSTEX_API_TOKEN        — PostEx merchant API token
 *   FIREBASE_SERVICE_ACCOUNT — Firebase service account JSON (full file contents)
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID — Firebase project ID
 */

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue }      = require("firebase-admin/firestore");

// Initialise once (Netlify may reuse the Lambda container)
if (!getApps().length) {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!sa) {
    console.error("FIREBASE_SERVICE_ACCOUNT env var is missing — postex-sync cannot run");
  } else {
    initializeApp({ credential: cert(JSON.parse(sa)) });
  }
}

const BASE = "https://api.postex.pk/services/integration/api";
const POSTEX_HEADERS = () => ({
  "Content-Type": "application/json",
  token: process.env.POSTEX_API_TOKEN,
});

// Maps PostEx transactionStatus → ZARAAR OrderStatus
// null means "don't change the ZARAAR status — just record postexStatus"
const STATUS_MAP = {
  "Booked":                         "dispatched",
  "Picked By PostEx":               "dispatched",
  "En-Route to PostEx warehouse":   "dispatched",
  "PostEx WareHouse":               "dispatched",
  "Out For Delivery":               "in_transit",
  "Attempted":                      "in_transit",
  "Delivery Under Review":          "in_transit",
  "Delivered":                      "delivered",
  "Out For Return":                 "return_in_transit",
  "Returned":                       null,
};

exports.handler = async () => {
  if (!process.env.POSTEX_API_TOKEN) {
    console.error("POSTEX_API_TOKEN missing");
    return { statusCode: 500, body: "Missing POSTEX_API_TOKEN" };
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("FIREBASE_SERVICE_ACCOUNT missing");
    return { statusCode: 500, body: "Missing FIREBASE_SERVICE_ACCOUNT" };
  }

  const db = getFirestore();

  // Single-field query (no composite index needed) — filter the rest in JS
  const snapshot = await db.collection("orders")
    .where("courierName", "==", "postex")
    .get();

  const all = snapshot.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(o => !!o.trackingNumber);

  const toSync    = all.filter(o => ["dispatched", "in_transit", "return_in_transit"].includes(o.status));
  const toSettle  = all.filter(o => o.status === "delivered" && o.paymentStatus !== "paid");

  console.log(`postex-sync: ${toSync.length} to sync, ${toSettle.length} to check settlement`);

  // ── 1. Status polling ────────────────────────────────────────────────────────
  for (const order of toSync) {
    try {
      const res = await fetch(
        `${BASE}/order/v1/track-order/${encodeURIComponent(order.trackingNumber)}`,
        { headers: POSTEX_HEADERS() },
      );
      const data = await res.json();
      const tracking = data?.dist;
      if (!tracking) { console.warn(`No tracking data for ${order.trackingNumber}`); continue; }

      const postexStatus  = tracking.transactionStatus || "";
      const zaararStatus  = STATUS_MAP[postexStatus] ?? null;

      const updates = {
        postexStatus,
        postexLastSync: FieldValue.serverTimestamp(),
        postexData:     JSON.stringify(tracking),
      };
      if (zaararStatus && zaararStatus !== order.status) {
        updates.status = zaararStatus;
        console.log(`${order.trackingNumber}: ${order.status} → ${zaararStatus} (PostEx: ${postexStatus})`);
      } else {
        console.log(`${order.trackingNumber}: postexStatus=${postexStatus}, no status change`);
      }

      await db.collection("orders").doc(order.id).update(updates);
    } catch (e) {
      console.error(`Failed to sync ${order.trackingNumber}:`, e);
    }
  }

  // ── 2. COD payment settlement ────────────────────────────────────────────────
  for (const order of toSettle) {
    try {
      const res = await fetch(
        `${BASE}/order/v1/payment-status/${encodeURIComponent(order.trackingNumber)}`,
        { headers: POSTEX_HEADERS() },
      );
      const data = await res.json();
      if (data?.dist?.settle === true) {
        await db.collection("orders").doc(order.id).update({
          paymentStatus: "paid",
          settledAt:     FieldValue.serverTimestamp(),
        });
        console.log(`Payment settled: ${order.trackingNumber}`);
      }
    } catch (e) {
      console.error(`Failed to check payment for ${order.trackingNumber}:`, e);
    }
  }

  return {
    statusCode: 200,
    body: `Synced ${toSync.length} orders, checked ${toSettle.length} settlements`,
  };
};
