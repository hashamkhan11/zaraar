import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled" | "returned";

export interface OrderData {
  name: string;
  phone: string;
  address: string;
  city: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface Order extends OrderData {
  id: string;
  status: OrderStatus;
  createdAt: Date;
}

/**
 * Save a new COD order to Firestore
 */
export async function createOrder(data: OrderData): Promise<string> {
  const docRef = await addDoc(collection(db, "orders"), {
    ...data,
    status: "pending" as OrderStatus,
    createdAt: serverTimestamp(),
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
  data: Partial<Pick<OrderData, "name" | "phone" | "address" | "city" | "quantity" | "note">>
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