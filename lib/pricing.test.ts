import { describe, it, expect } from "vitest";
import { computeOrderPricing } from "./pricing";
import { CATALOG, DELIVERY_FEE } from "@/data/products";

describe("computeOrderPricing", () => {
  it("prices a known product from the catalog, ignoring anything the caller might claim", () => {
    const product = CATALOG[0];
    const pricing = computeOrderPricing(product.id, 1);

    expect(pricing.price).toBe(product.price);
    expect(pricing.deliveryFee).toBe(DELIVERY_FEE);
    expect(pricing.total).toBe(product.price + DELIVERY_FEE);
  });

  it("scales the product price with quantity but keeps delivery flat", () => {
    const product = CATALOG[0];
    const pricing = computeOrderPricing(product.id, 3);

    expect(pricing.total).toBe(product.price * 3 + DELIVERY_FEE);
  });

  it("rejects a productId that isn't in the catalog — this is the actual price-tampering fix", () => {
    expect(() => computeOrderPricing("does-not-exist", 1)).toThrow(/Unknown productId/);
  });

  it("rejects a non-positive or non-integer quantity", () => {
    const product = CATALOG[0];
    expect(() => computeOrderPricing(product.id, 0)).toThrow(/Invalid quantity/);
    expect(() => computeOrderPricing(product.id, -1)).toThrow(/Invalid quantity/);
    expect(() => computeOrderPricing(product.id, 1.5)).toThrow(/Invalid quantity/);
  });
});
