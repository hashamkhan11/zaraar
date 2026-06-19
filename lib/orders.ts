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
import { catalog } from "@/data/catalog";

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

export interface OrderData {
  orderNumber?: number;
  name: string;
  phone: string;
  address?: string;
  city: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  note?: string;
  paymentStatus?: "pending" | "paid" | "failed";
  trackingNumber?: string;
  courierName?: "postex" | "leopard" | string;
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
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Order, "id">),
    createdAt: d.data().createdAt?.toDate() ?? new Date(),
  }));
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
      const orders = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, "id">),
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      }));
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
  const groupIds = catalog.flatMap(c => c.groups.map(g => g.id));
  const productCounts: Record<string, number> = {};
  orders.forEach(o => {
    if (o.createdAt instanceof Date && o.createdAt >= oneDayAgo) {
      const groupId = groupIds.find(id => o.productId.startsWith(id));
      if (groupId) productCounts[groupId] = (productCounts[groupId] || 0) + 1;
    }
  });

  await setDoc(doc(db, "meta", "publicStats"), {
    deliveredCount: delivered.length,
    topCities,
    productCounts,
    updatedAt: serverTimestamp(),
  });
}