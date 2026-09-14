import {
  collection, addDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy, onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export type ExpenseType =
  | "stock"
  | "packaging"
  | "ads"
  | "courier_charge"
  | "courier_payment";

export const EXPENSE_LABELS: Record<ExpenseType, string> = {
  stock:            "Stock Purchase",
  packaging:        "Packaging / Boxes",
  ads:              "Ad Spend",
  courier_charge:   "Courier Charges",
  courier_payment:  "Courier Payment Received",
};

// true = money IN (income), false = money OUT (expense)
export const EXPENSE_IS_INCOME: Record<ExpenseType, boolean> = {
  stock:            false,
  packaging:        false,
  ads:              false,
  courier_charge:   false,
  courier_payment:  true,
};

export const EXPENSE_COLORS: Record<ExpenseType, string> = {
  stock:            "text-blue-700 bg-blue-50 border-blue-200",
  packaging:        "text-indigo-700 bg-indigo-50 border-indigo-200",
  ads:              "text-purple-700 bg-purple-50 border-purple-200",
  courier_charge:   "text-orange-700 bg-orange-50 border-orange-200",
  courier_payment:  "text-green-700 bg-green-50 border-green-200",
};

export interface ExpenseData {
  type: ExpenseType;
  amount: number;
  note?: string;
  date: string; // YYYY-MM-DD
}

export interface Expense extends ExpenseData {
  id: string;
  createdAt: Date;
}

export interface ProfitLoss {
  income: number;
  costs: number;
  net: number;
  byType: { type: ExpenseType; total: number }[];
}

/** Computes income/costs/net P&L for a list of expenses (e.g. a day or month's worth). */
export function calcPL(list: Expense[]): ProfitLoss {
  const income = list.filter((e) => EXPENSE_IS_INCOME[e.type]).reduce((s, e) => s + e.amount, 0);
  const costs  = list.filter((e) => !EXPENSE_IS_INCOME[e.type]).reduce((s, e) => s + e.amount, 0);
  const byType = (Object.keys(EXPENSE_LABELS) as ExpenseType[]).map((t) => ({
    type: t,
    total: list.filter((e) => e.type === t).reduce((s, e) => s + e.amount, 0),
  }));
  return { income, costs, net: income - costs, byType };
}

export async function addExpense(data: ExpenseData): Promise<string> {
  const payload = Object.fromEntries(
    Object.entries({ ...data, createdAt: serverTimestamp() }).filter(([, v]) => v !== undefined)
  );
  const ref = await addDoc(collection(db, "expenses"), payload);
  return ref.id;
}

export async function deleteExpense(id: string): Promise<void> {
  await deleteDoc(doc(db, "expenses", id));
}

export function subscribeToExpenses(
  callback: (expenses: Expense[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const expenses = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Expense, "id">),
        createdAt: d.data().createdAt?.toDate() ?? new Date(),
      }));
      callback(expenses);
    },
    onError
  );
}
