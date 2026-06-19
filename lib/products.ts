import { collection, doc, setDoc, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export interface ProductOverride {
  price?: number;
  badge?: string;
}
export type ProductOverrides = Record<string, ProductOverride>;

// One-time cached fetch for customer-facing components
let _cache: ProductOverrides | null = null;
let _promise: Promise<ProductOverrides> | null = null;

export async function getProductOverrides(): Promise<ProductOverrides> {
  if (_cache) return _cache;
  if (!_promise) {
    _promise = getDocs(collection(db, "products")).then((snap) => {
      const out: ProductOverrides = {};
      snap.docs.forEach((d) => { out[d.id] = d.data() as ProductOverride; });
      _cache = out;
      _promise = null; // clear so future invalidations re-fetch cleanly
      return out;
    });
  }
  return _promise;
}

export async function setProductOverride(groupId: string, data: ProductOverride): Promise<void> {
  _cache = null;
  _promise = null; // force re-fetch on next read
  await setDoc(doc(db, "products", groupId), data, { merge: true });
}

export function subscribeToProductOverrides(cb: (overrides: ProductOverrides) => void): () => void {
  return onSnapshot(collection(db, "products"), (snap) => {
    const out: ProductOverrides = {};
    snap.docs.forEach((d) => { out[d.id] = d.data() as ProductOverride; });
    _cache = out;
    cb(out);
  });
}
