import {
  doc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface StockMap {
  [productId: string]: number;
}

export async function setStock(productId: string, stock: number): Promise<void> {
  const ref = doc(db, "stock", productId);
  await setDoc(ref, { productId, stock, updatedAt: serverTimestamp() }, { merge: true });
}

export async function adjustStock(productId: string, delta: number): Promise<void> {
  const ref = doc(db, "stock", productId);
  await updateDoc(ref, { stock: increment(delta), updatedAt: serverTimestamp() }).catch(() =>
    setDoc(ref, { productId, stock: Math.max(0, delta), updatedAt: serverTimestamp() })
  );
}

export function subscribeToStock(callback: (stock: StockMap) => void): () => void {
  return onSnapshot(collection(db, "stock"), (snap) => {
    const result: StockMap = {};
    snap.docs.forEach((d) => {
      result[d.id] = (d.data().stock as number) ?? 0;
    });
    callback(result);
  });
}
