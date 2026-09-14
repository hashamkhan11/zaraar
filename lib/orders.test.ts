import { describe, it, expect } from "vitest";
import {
  getOrderItems,
  getOrderTotal,
  getOrderQuantity,
  getOrderProductLabel,
  type OrderData,
} from "./orders";

function legacyOrder(overrides: Partial<OrderData> = {}): OrderData {
  return {
    name: "Test Customer",
    phone: "03001234567",
    city: "Lahore",
    productId: "p1",
    productName: "Product One",
    price: 3200,
    quantity: 1,
    ...overrides,
  };
}

describe("getOrderTotal", () => {
  it("for a legacy single-item order, is just price * quantity (delivery already baked in)", () => {
    const order = legacyOrder({ price: 3200, quantity: 2 });
    expect(getOrderTotal(order)).toBe(6400);
  });

  it("for a multi-item order, sums each line's price * quantity, plus a flat delivery fee", () => {
    const order = legacyOrder({
      items: [
        { productId: "p1", productName: "Product One", price: 3000, quantity: 2 },
        { productId: "p2", productName: "Product Two", price: 4500, quantity: 1 },
      ],
      deliveryFee: 200,
    });
    // (3000*2) + (4500*1) + 200
    expect(getOrderTotal(order)).toBe(10700);
  });

  it("treats a missing deliveryFee on a multi-item order as zero, not NaN", () => {
    const order = legacyOrder({
      items: [{ productId: "p1", productName: "Product One", price: 1000, quantity: 1 }],
    });
    expect(getOrderTotal(order)).toBe(1000);
  });

  it("ignores an empty items array and falls back to the legacy fields", () => {
    const order = legacyOrder({ price: 500, quantity: 3, items: [] });
    expect(getOrderTotal(order)).toBe(1500);
  });
});

describe("getOrderItems", () => {
  it("wraps a legacy order's single product into a one-item array", () => {
    const order = legacyOrder();
    expect(getOrderItems(order)).toEqual([
      { productId: "p1", productName: "Product One", price: 3200, quantity: 1 },
    ]);
  });

  it("returns items as-is when present", () => {
    const items = [{ productId: "p1", productName: "Product One", price: 3000, quantity: 2 }];
    const order = legacyOrder({ items });
    expect(getOrderItems(order)).toBe(items);
  });
});

describe("getOrderQuantity", () => {
  it("sums quantity across all product lines", () => {
    const order = legacyOrder({
      items: [
        { productId: "p1", productName: "Product One", price: 3000, quantity: 2 },
        { productId: "p2", productName: "Product Two", price: 4500, quantity: 3 },
      ],
    });
    expect(getOrderQuantity(order)).toBe(5);
  });

  it("returns the legacy quantity for a single-item order", () => {
    expect(getOrderQuantity(legacyOrder({ quantity: 4 }))).toBe(4);
  });
});

describe("getOrderProductLabel", () => {
  it("returns the plain product name for a single-item order", () => {
    expect(getOrderProductLabel(legacyOrder())).toBe("Product One");
  });

  it("summarizes a multi-item order as 'first item +N more'", () => {
    const order = legacyOrder({
      items: [
        { productId: "p1", productName: "Product One", price: 3000, quantity: 1 },
        { productId: "p2", productName: "Product Two", price: 4500, quantity: 1 },
        { productId: "p3", productName: "Product Three", price: 5000, quantity: 1 },
      ],
    });
    expect(getOrderProductLabel(order)).toBe("Product One +2 more");
  });
});
