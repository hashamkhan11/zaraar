/**
 * Public customer-facing tracking endpoint.
 * Accepts: GET /api/track-order?cn=CX-XXXXXXXXXX
 * Returns bilingual status, timeline, and estimated delivery.
 */

const BASE = "https://api.postex.pk/services/integration/api";

// PostEx status code → our mapping
const STATUS_MAP = {
  "0001": { en: "Order Booked",              ur: "آرڈر بک ہو گیا",              step: 1 },
  "0002": { en: "Picked Up",                 ur: "پک اپ ہو گیا",                step: 2 },
  "0003": { en: "In Transit",                ur: "راستے میں ہے",                 step: 3 },
  "0004": { en: "Out for Delivery",          ur: "ڈلیوری کے لیے نکل گیا",        step: 4 },
  "0005": { en: "Delivered",                 ur: "ڈلیور ہو گیا",                 step: 5 },
  "0006": { en: "Delivery Attempted",        ur: "ڈلیوری کی کوشش کی گئی",        step: 4 },
  "0007": { en: "Returned to Origin",        ur: "واپس کر دیا گیا",              step: 5 },
  "0008": { en: "Cancelled",                 ur: "منسوخ کر دیا گیا",             step: 0 },
  "0009": { en: "Return in Transit",         ur: "واپسی راستے میں",              step: 4 },
  "0010": { en: "Return Delivered",          ur: "واپسی مل گئی",                 step: 5 },
  "0011": { en: "Partial Delivery",          ur: "جزوی ڈلیوری",                  step: 4 },
  "0012": { en: "Misrouted",                 ur: "غلط راستہ",                    step: 3 },
  "0013": { en: "Hold",                      ur: "روکا گیا",                     step: 3 },
};

exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };

  const cn = (event.queryStringParameters || {}).cn;
  if (!cn) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ ok: false, error: "cn parameter required" }) };
  }

  const token = process.env.POSTEX_API_TOKEN;
  if (!token) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: "Service unavailable" }) };
  }

  try {
    const res = await fetch(`${BASE}/order/v1/track-order/${encodeURIComponent(cn)}`, {
      headers: { "Content-Type": "application/json", token },
    });

    if (!res.ok) {
      return { statusCode: res.status, headers: cors, body: JSON.stringify({ ok: false, error: "Tracking failed" }) };
    }

    const raw = await res.json();

    // PostEx wraps data in dist/trackingInfo or similar — handle both shapes
    const info = raw?.dist || raw?.data || raw;
    const history = (info?.trackingHistory || info?.history || []).map((h) => {
      const mapped = STATUS_MAP[h.statusCode] || { en: h.statusMessage || h.status || "Update", ur: h.statusMessage || "اپڈیٹ", step: 0 };
      return {
        code: h.statusCode,
        en: mapped.en,
        ur: mapped.ur,
        step: mapped.step,
        timestamp: h.dateTime || h.createdAt || null,
        location: h.location || null,
      };
    });

    const latestCode = history.length > 0 ? history[history.length - 1].code : null;
    const latestStatus = latestCode ? STATUS_MAP[latestCode] : null;

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        ok: true,
        cn,
        statusCode: latestCode,
        statusEn: latestStatus?.en || "Tracking Active",
        statusUr: latestStatus?.ur || "ٹریکنگ جاری ہے",
        step: latestStatus?.step || 0,
        estimatedDelivery: info?.estimatedDeliveryDate || null,
        history,
        raw: info,
      }),
    };
  } catch (err) {
    console.error("track-order error:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: String(err) }) };
  }
};
