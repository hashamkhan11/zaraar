import { Order, OrderStatus, getOrderTotal, getOrderProductLabel, getOrderQuantity } from "@/lib/orders";
import { trackUrl } from "./utils";

function buildWAMsg(order: Order): string {
  const total = getOrderTotal(order);
  const cn = order.trackingNumber ?? "";
  return encodeURIComponent([
    `Your order has been dispatched! 🚚`,
    `━━━━━━━━━━━━━`,
    `👤 *Name:* ${order.name}`,
    `📦 *Product:* ${getOrderProductLabel(order)}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()}`,
    "",
    cn ? `📋 *Tracking Number:* ${cn}` : "",
    cn ? `🔗 *Track here:* ${trackUrl(cn)}` : "",
    "",
    `📞 For any queries, message us here`,
    `━━━━━━━━━━━━━`,
    `_ZARAAR — Your Trust, Our Pride_`,
  ].filter(Boolean).join("\n"));
}

export function waHref(order: Order) {
  return `https://wa.me/92${order.phone.replace(/^0/,"")}?text=${buildWAMsg(order)}`;
}

export function waHrefWithText(order: Order, text: string) {
  return `https://wa.me/92${order.phone.replace(/^0/,"")}?text=${encodeURIComponent(text)}`;
}

// ─── Status-specific WA message builders ─────────────────────────────────────
function waMsg_confirmed(order: Order): string {
  const total = getOrderTotal(order);
  return [
    `Hi ${order.name}! 👋`,
    ``,
    `Your order with *ZARAAR* has been confirmed ✅`,
    ``,
    `📦 *Product:* ${getOrderProductLabel(order)}`,
    `🔢 *Quantity:* ${getOrderQuantity(order)}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()}`,
    `📍 *Delivery to:* ${order.city}`,
    ``,
    `We will dispatch your order soon and share the tracking number with you.`,
    ``,
    `Thank you for shopping with us! 🙏`,
    `— ZARAAR`,
  ].join("\n");
}

function waMsg_dispatched(order: Order): string {
  const total = getOrderTotal(order);
  const cn = order.trackingNumber ?? "";
  return [
    `Hi ${order.name}! 🚚`,
    ``,
    `Your *ZARAAR* order has been dispatched!`,
    ``,
    `📦 *Product:* ${getOrderProductLabel(order)}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()}`,
    cn ? `📋 *Tracking Number:* ${cn}` : "",
    cn ? `🔗 *Track here:* ${trackUrl(cn)}` : "",
    ``,
    `Please keep the COD amount ready upon delivery.`,
    ``,
    `📞 Any questions? Message us here!`,
    `— ZARAAR`,
  ].filter(Boolean).join("\n");
}

function waMsg_outForDelivery(order: Order): string {
  const total = getOrderTotal(order);
  const cn = order.trackingNumber ?? "";
  return [
    `Hi ${order.name}! 📦`,
    ``,
    `Great news — your *ZARAAR* order is *out for delivery today!*`,
    ``,
    `📦 *Product:* ${getOrderProductLabel(order)}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()} _(please keep cash ready)_`,
    cn ? `📋 *Tracking:* ${cn}` : "",
    cn ? `🔗 *Track here:* ${trackUrl(cn)}` : "",
    ``,
    `Please be available to receive your order.`,
    ``,
    `Thank you! 🙏`,
    `— ZARAAR`,
  ].filter(Boolean).join("\n");
}

function waMsg_delivered(order: Order): string {
  return [
    `Hi ${order.name}! 🎉`,
    ``,
    `Your *ZARAAR* order has been delivered — we hope you love it! ❤️`,
    ``,
    `📦 *Product:* ${getOrderProductLabel(order)}`,
    ``,
    `If you're happy with your purchase, please share it with your friends and family! 😊`,
    ``,
    `Thank you for shopping with us!`,
    `— ZARAAR`,
  ].join("\n");
}

function waMsg_failedDelivery(order: Order): string {
  const total = getOrderTotal(order);
  return [
    `Hi ${order.name},`,
    ``,
    `We attempted to deliver your order but were unable to reach you. 😔`,
    ``,
    `📦 *Product:* ${getOrderProductLabel(order)}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()}`,
    ``,
    `Please reply here or call us to reschedule your delivery at your convenience.`,
    ``,
    `— ZARAAR`,
  ].join("\n");
}

function waMsg_returned(order: Order): string {
  const total = getOrderTotal(order);
  return [
    `Hi ${order.name},`,
    ``,
    `Your order has been returned to us as we were unable to complete the delivery.`,
    ``,
    `📦 *Product:* ${getOrderProductLabel(order)}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()}`,
    ``,
    `If you'd like to re-order or have any questions, please message us here.`,
    ``,
    `— ZARAAR`,
  ].join("\n");
}

function waMsg_returnInTransit(order: Order): string {
  const total = getOrderTotal(order);
  return [
    `Hi ${order.name},`,
    ``,
    `Your *ZARAAR* order is currently on its way back to us. 📦`,
    ``,
    `📦 *Product:* ${getOrderProductLabel(order)}`,
    `💰 *COD Amount:* PKR ${total.toLocaleString()}`,
    ``,
    `If you'd like to reschedule delivery or have any questions, please reply here.`,
    ``,
    `— ZARAAR`,
  ].join("\n");
}

// Returns contextually relevant WA messages for the current order status
export function getWAMsgs(order: Order): { key: string; label: string; text: string }[] {
  const map: Record<OrderStatus, { key: string; label: string; text: string }[]> = {
    pending:         [{ key:"confirm",         label:"✅ Order Confirmed",        text: waMsg_confirmed(order) }],
    confirmed:       [{ key:"confirm",         label:"✅ Order Confirmed",        text: waMsg_confirmed(order) },
                     { key:"dispatch",         label:"🚚 Order Dispatched",       text: waMsg_dispatched(order) }],
    dispatched:      [{ key:"dispatch",        label:"🚚 Order Dispatched",       text: waMsg_dispatched(order) },
                     { key:"outForDelivery",   label:"📦 Out for Delivery",       text: waMsg_outForDelivery(order) }],
    in_transit:      [{ key:"outForDelivery",  label:"📦 Out for Delivery",       text: waMsg_outForDelivery(order) },
                     { key:"dispatch",         label:"🚚 Order Dispatched",       text: waMsg_dispatched(order) }],
    delivered:         [{ key:"delivered",         label:"🎉 Thank You / Delivered",  text: waMsg_delivered(order) }],
    failed_delivery:   [{ key:"failed",            label:"😔 Failed Delivery",        text: waMsg_failedDelivery(order) }],
    return_in_transit: [{ key:"returnInTransit",   label:"📦 Return in Transit",      text: waMsg_returnInTransit(order) }],
    returned:          [{ key:"returned",          label:"📦 Return Received",        text: waMsg_returned(order) }],
    cancelled:         [],
  };
  return map[order.status] ?? [];
}
