// Relative import (not the "@/" alias) — this module is required directly
// by netlify/functions/create-order.js, whose esbuild bundle doesn't apply
// the Next.js/tsconfig path-alias resolution.
import { CATALOG, DELIVERY_FEE, type ZararProduct } from "../data/products";

export interface OrderPricing {
  product: ZararProduct;
  /** Per-unit catalog price — never taken from the client. */
  price: number;
  quantity: number;
  deliveryFee: number;
  /** price * quantity + deliveryFee (flat, not multiplied by quantity). */
  total: number;
}

/**
 * The single authoritative place an order's price is decided. Looks up the
 * product in the bundled catalog (data/products.ts) and computes the COD
 * total from it — the caller's own idea of the price, if any, is ignored.
 *
 * Used by netlify/functions/create-order.js so the checkout total can never
 * be supplied by the client.
 */
export function computeOrderPricing(productId: string, quantity: number): OrderPricing {
  const product = CATALOG.find((p) => p.id === productId);
  if (!product) {
    throw new Error(`Unknown productId: ${productId}`);
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(`Invalid quantity: ${quantity}`);
  }

  const price = product.price;
  const total = price * quantity + DELIVERY_FEE;

  return { product, price, quantity, deliveryFee: DELIVERY_FEE, total };
}
