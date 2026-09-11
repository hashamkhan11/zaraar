import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";
import { CATALOG } from "@/data/products";

export async function getNextOrderNumber(): Promise<number> {
  const counterRef = doc(db, "meta", "orderCounter");
  return runTransaction(db, async (t) => {
    const snap = await t.get(counterRef);
    const next = snap.exists() ? (snap.data().value as number) + 1 : 1001;
    t.set(counterRef, { value: next });
    return next;
  });
}

export type OrderStatus = "pending" | "confirmed" | "dispatched" | "in_transit" | "delivered" | "failed_delivery" | "return_in_transit" | "returned" | "cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface OrderData {
  orderNumber?: number;
  name: string;
  phone: string;
  address?: string;
  city: string;
  // Primary/legacy product fields — always populated. For multi-product orders
  // (see `items` below) these mirror the first line item so any code that
  // hasn't been updated to read `items` still sees a sane single product.
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  // Present only on orders with more than one product line (admin-created,
  // e.g. a bulk/discounted multi-watch order). When set, this is the source
  // of truth for the order's contents — use getOrderItems()/getOrderTotal()
  // rather than reading productName/price/quantity directly.
  items?: OrderItem[];
  // Delivery surcharge for multi-item orders, kept separate from item prices
  // so each line's price can be freely discounted without losing track of
  // the flat delivery fee. Legacy single-item orders bake the delivery fee
  // into `price` directly and leave this unset.
  deliveryFee?: number;
  note?: string;
  paymentStatus?: "pending" | "paid" | "failed";
  trackingNumber?: string;
  courierName?: "postex" | "leopard" | string;
  // Instruction sent to PostEx as `transactionNotes` at booking time (e.g.
  // "allow customer to open parcel before payment"). Kept separate from
  // `note` since that's a general admin/customer note, not a courier directive.
  courierNote?: string;
  estimatedDeliveryDate?: Date;
  dispatchCost?: number;
  // PostEx sync
  postexStatus?: string;
  postexData?: string;
  postexLastSync?: Date;
  // Call workflow
  callAttempts?: number;
  lastCallAt?: Date;
  callNote?: string;
}

/** Returns the order's product lines — the `items` array if present, otherwise the single legacy product as a one-item array. */
export function getOrderItems(order: OrderData): OrderItem[] {
  if (order.items && order.items.length > 0) return order.items;
  return [{ productId: order.productId, productName: order.productName, price: order.price, quantity: order.quantity }];
}

/** Returns the full COD amount for the order, including delivery fee. */
export function getOrderTotal(order: OrderData): number {
  if (order.items && order.items.length > 0) {
    return order.items.reduce((s, i) => s + i.price * i.quantity, 0) + (order.deliveryFee ?? 0);
  }
  return order.price * order.quantity;
}

/** Total piece count across all product lines. */
export function getOrderQuantity(order: OrderData): number {
  return getOrderItems(order).reduce((s, i) => s + i.quantity, 0);
}

/** A short, single-line product label suitable for table rows and lists. */
export function getOrderProductLabel(order: OrderData): string {
  const items = getOrderItems(order);
  if (items.length <= 1) return items[0]?.productName ?? order.productName;
  return `${items[0].productName} +${items.length - 1} more`;
}

export interface Order extends OrderData {
  id: string;
  status: OrderStatus;
  createdAt: Date;
}

function normalizePhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("92") && d.length >= 12) return "0" + d.slice(2);
  return d;
}

// Maps old series names stored in Firestore orders to current ZARAAR brand names.
// Runs at ingestion so every downstream use (display, WA messages, CSV, search)
// is automatically clean without touching the 2,000+ existing Firestore records.
const LEGACY_SERIES: Record<string, string> = {
  "patek philippe design":    "Classic Series",
  "patek philippe dual tone": "Prestige Series",
  "tissot design":            "Urban Series",
  "hublot design":            "Skeleton Series",
};

function cleanProductName(name: string): string {
  if (!name) return name;
  const pipe = name.indexOf(" | ");
  if (pipe !== -1) {
    const product = name.slice(0, pipe).replace(/^PP\s+/i, "").trim();
    const series  = name.slice(pipe + 3).trim();
    const mapped  = LEGACY_SERIES[series.toLowerCase()];
    return `${product} | ${mapped ?? series}`;
  }
  return name.replace(/^PP\s+/i, "").trim();
}

/**
 * Save a new COD order to Firestore
 * OPTIMIZED: Order is saved instantly with a temp number,
 * then the real sequential order number is patched in the background.
 * This removes the blocking transaction round-trip from the customer's wait time.
 */
export async function createOrder(data: OrderData): Promise<string> {
  // Generate a temporary order number locally (no Firestore round-trip needed)
  // Format: timestamp-based so it's always unique and roughly sequential
  const tempOrderNumber = Math.floor(Date.now() / 1000) - 1700000000 + 1000;

  const payload = Object.fromEntries(
    Object.entries({
      ...data,
      phone: normalizePhone(data.phone),
      orderNumber: tempOrderNumber,
      status: "pending" as OrderStatus,
      createdAt: serverTimestamp(),
    }).filter(([, v]) => v !== undefined)
  );

  // Single Firestore write — customer waits for this only (fast)
  const docRef = await addDoc(collection(db, "orders"), payload);

  // Patch the real sequential order number in the background
  // Customer is already on the success screen while this runs
  getNextOrderNumber()
    .then((realOrderNumber) => {
      updateDoc(docRef, { orderNumber: realOrderNumber }).catch(() => {
        // Silent fail — order is already saved, number will just stay as temp
      });
    })
    .catch(() => {
      // Silent fail — order is saved and working, only display number is affected
    });

  return docRef.id;
}

/**
 * Fetch all orders sorted by newest first
 */
export async function getOrders(): Promise<Order[]> {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data() as Omit<Order, "id">;
    return {
      id: d.id,
      ...data,
      productName: cleanProductName(data.productName),
      createdAt: d.data().createdAt?.toDate() ?? new Date(),
    };
  });
}

/**
 * Update the status of an order
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, { status });
}

/**
 * Permanently delete an order from Firestore
 */
export async function deleteOrder(orderId: string): Promise<void> {
  const ref = doc(db, "orders", orderId);
  await deleteDoc(ref);
}

/**
 * Update editable fields on an order
 */
export async function updateOrder(
  orderId: string,
  data: Partial<OrderData>
): Promise<void> {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, data as Record<string, unknown>);
}

/**
 * Subscribe to real-time order updates, newest first
 */
export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => {
        const data = d.data() as Omit<Order, "id">;
        return {
          id: d.id,
          ...data,
          productName: cleanProductName(data.productName),
          createdAt: d.data().createdAt?.toDate() ?? new Date(),
        };
      });
      callback(orders);
    },
    onError
  );
}

// ── Public stats (readable by storefront) ─────────────────────────────────────

export interface PublicStats {
  deliveredCount: number;
  topCities: string[];
  productCounts?: Record<string, number>;
}

export async function getPublicStats(): Promise<PublicStats> {
  try {
    const snap = await getDoc(doc(db, "meta", "publicStats"));
    if (!snap.exists()) return { deliveredCount: 0, topCities: [] };
    return snap.data() as PublicStats;
  } catch { return { deliveredCount: 0, topCities: [] }; }
}

export async function updatePublicStats(orders: Order[]): Promise<void> {
  const delivered = orders.filter(o => o.status === "delivered");
  const cityCount: Record<string, number> = {};
  delivered.forEach(o => {
    const c = o.city.trim();
    cityCount[c] = (cityCount[c] || 0) + 1;
  });
  const topCities = Object.entries(cityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([c]) => c);

  const oneDayAgo = new Date(Date.now() - 86400000);
  const productIds = new Set(CATALOG.map(p => p.id));
  const productCounts: Record<string, number> = {};
  orders.forEach(o => {
    if (o.createdAt instanceof Date && o.createdAt >= oneDayAgo) {
      for (const item of getOrderItems(o)) {
        if (productIds.has(item.productId)) productCounts[item.productId] = (productCounts[item.productId] || 0) + 1;
      }
    }
  });

  await setDoc(doc(db, "meta", "publicStats"), {
    deliveredCount: delivered.length,
    topCities,
    productCounts,
    updatedAt: serverTimestamp(),
  });
}