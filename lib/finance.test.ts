import { describe, it, expect } from "vitest";
import { calcPL, type Expense } from "./finance";

function expense(overrides: Partial<Expense>): Expense {
  return {
    id: "e1",
    type: "stock",
    amount: 0,
    date: "2024-01-01",
    createdAt: new Date("2024-01-01"),
    ...overrides,
  };
}

describe("calcPL", () => {
  it("treats courier_payment as income and everything else as a cost", () => {
    const list: Expense[] = [
      expense({ id: "1", type: "courier_payment", amount: 10000 }),
      expense({ id: "2", type: "stock", amount: 3000 }),
      expense({ id: "3", type: "ads", amount: 1500 }),
    ];
    const pl = calcPL(list);
    expect(pl.income).toBe(10000);
    expect(pl.costs).toBe(4500);
    expect(pl.net).toBe(5500);
  });

  it("returns zeroed totals for an empty list", () => {
    const pl = calcPL([]);
    expect(pl).toEqual({
      income: 0,
      costs: 0,
      net: 0,
      byType: [
        { type: "stock", total: 0 },
        { type: "packaging", total: 0 },
        { type: "ads", total: 0 },
        { type: "courier_charge", total: 0 },
        { type: "courier_payment", total: 0 },
      ],
    });
  });

  it("groups totals per expense type, summing repeats of the same type", () => {
    const list: Expense[] = [
      expense({ id: "1", type: "ads", amount: 500 }),
      expense({ id: "2", type: "ads", amount: 700 }),
      expense({ id: "3", type: "packaging", amount: 200 }),
    ];
    const pl = calcPL(list);
    const adsTotal = pl.byType.find((b) => b.type === "ads")?.total;
    const packagingTotal = pl.byType.find((b) => b.type === "packaging")?.total;
    expect(adsTotal).toBe(1200);
    expect(packagingTotal).toBe(200);
  });

  it("can produce a negative net when costs exceed income", () => {
    const list: Expense[] = [
      expense({ id: "1", type: "courier_payment", amount: 1000 }),
      expense({ id: "2", type: "stock", amount: 5000 }),
    ];
    expect(calcPL(list).net).toBe(-4000);
  });
});
