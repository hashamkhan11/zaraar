/**
 * PostEx API proxy — keeps the API token server-side.
 * Actions: book | track | track-bulk | cancel | shipper-advice | payment-status | awb | addresses
 */

const BASE = "https://api.postex.pk/services/integration/api";

const HEADERS = () => ({
  "Content-Type": "application/json",
  token: process.env.POSTEX_API_TOKEN,
});

exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  const token = process.env.POSTEX_API_TOKEN;
  const pickupCity = process.env.POSTEX_PICKUP_CITY || "Faisalabad";

  if (!token) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: "Missing POSTEX_API_TOKEN" }) };
  }

  const params = event.queryStringParameters || {};
  const action = params.action;

  try {
    // ── BOOK ──────────────────────────────────────────────────────────────────
    if (action === "book") {
      if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers: cors, body: JSON.stringify({ ok: false, error: "POST required" }) };
      }
      const order = JSON.parse(event.body);
      const payload = {
        cityName: order.city,
        customerName: order.name,
        customerPhone: order.phone,
        deliveryAddress: order.address,
        invoiceDivision: 1,
        invoicePayment: String(order.price * order.quantity),
        items: order.quantity,
        orderDetail: order.productName,
        orderRefNumber: order.orderId,
        orderType: "Normal",
        pickupAddressCode: "default",
        senderName: "WatchesByFahad",
        storeId: "",
      };
      const res = await fetch(`${BASE}/order/v3/create-order`, {
        method: "POST",
        headers: HEADERS(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return { statusCode: res.status, headers: cors, body: JSON.stringify({ ok: res.ok, data }) };
    }

    // ── TRACK ─────────────────────────────────────────────────────────────────
    if (action === "track") {
      const cn = params.cn;
      if (!cn) return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "cn required" }) };
      const res = await fetch(`${BASE}/order/v1/track-order/${encodeURIComponent(cn)}`, {
        headers: HEADERS(),
      });
      const data = await res.json();
      return { statusCode: res.status, headers: cors, body: JSON.stringify({ ok: res.ok, data }) };
    }

    // ── TRACK BULK ────────────────────────────────────────────────────────────
    if (action === "track-bulk") {
      const cns = params.cns; // comma-separated
      if (!cns) return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "cns required" }) };
      const results = await Promise.all(
        cns.split(",").filter(Boolean).map(async (cn) => {
          try {
            const res = await fetch(`${BASE}/order/v1/track-order/${encodeURIComponent(cn.trim())}`, {
              headers: HEADERS(),
            });
            const data = await res.json();
            return { cn: cn.trim(), ok: res.ok, data };
          } catch (e) {
            return { cn: cn.trim(), ok: false, error: String(e) };
          }
        })
      );
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true, results }) };
    }

    // ── CANCEL ────────────────────────────────────────────────────────────────
    if (action === "cancel") {
      if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers: cors, body: JSON.stringify({ ok: false, error: "POST required" }) };
      }
      const { cn } = JSON.parse(event.body);
      const res = await fetch(`${BASE}/order/v1/cancel-order`, {
        method: "POST",
        headers: HEADERS(),
        body: JSON.stringify({ trackingNumber: cn }),
      });
      const data = await res.json();
      return { statusCode: res.status, headers: cors, body: JSON.stringify({ ok: res.ok, data }) };
    }

    // ── AWB (label PDF) ───────────────────────────────────────────────────────
    if (action === "awb") {
      const cns = params.cns;
      if (!cns) return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "cns required" }) };
      const res = await fetch(`${BASE}/order/v1/getinvoice?trackingNumbers=${encodeURIComponent(cns)}`, {
        headers: HEADERS(),
      });
      const data = await res.json();
      return { statusCode: res.status, headers: cors, body: JSON.stringify({ ok: res.ok, data }) };
    }

    // ── SHIPPER ADVICE (return or retry) ──────────────────────────────────────
    if (action === "shipper-advice") {
      if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers: cors, body: JSON.stringify({ ok: false, error: "POST required" }) };
      }
      // statusId: 1=request return, 2=retry delivery
      const { cn, statusId } = JSON.parse(event.body);
      const res = await fetch(`${BASE}/order/v1/shipperadvice`, {
        method: "POST",
        headers: HEADERS(),
        body: JSON.stringify({ trackingNumber: cn, statusId }),
      });
      const data = await res.json();
      return { statusCode: res.status, headers: cors, body: JSON.stringify({ ok: res.ok, data }) };
    }

    // ── PAYMENT STATUS ────────────────────────────────────────────────────────
    if (action === "payment-status") {
      const cn = params.cn;
      if (!cn) return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "cn required" }) };
      const res = await fetch(`${BASE}/order/v1/payment-status/${encodeURIComponent(cn)}`, {
        headers: HEADERS(),
      });
      const data = await res.json();
      return { statusCode: res.status, headers: cors, body: JSON.stringify({ ok: res.ok, data }) };
    }

    // ── ADDRESSES ─────────────────────────────────────────────────────────────
    if (action === "addresses") {
      const res = await fetch(`${BASE}/order/v1/pickup-addresses`, {
        headers: HEADERS(),
      });
      const data = await res.json();
      return { statusCode: res.status, headers: cors, body: JSON.stringify({ ok: res.ok, data }) };
    }

    // ── CITIES ───────────────────────────────────────────────────────────────
    if (action === "cities") {
      const res = await fetch(`${BASE}/cities`, { headers: HEADERS() });
      const data = await res.json();
      return { statusCode: res.status, headers: cors, body: JSON.stringify({ ok: res.ok, data }) };
    }

    return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: `Unknown action: ${action}` }) };

  } catch (err) {
    console.error("postex function error:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: String(err) }) };
  }
};
