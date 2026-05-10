# WatchesByFahad Admin Panel — Complete Specification
**Date:** 2026-05-09  
**Owner:** Fahad  
**Status:** Requirements Locked ✅

---

## **1. ORDER STATE SYSTEM** 📦

### New State Flow (Complete Redesign)
```
pending
  ↓
confirmed (stock reserved, COD verified)
  ↓
dispatched (left warehouse with tracking)
  ├→ in_transit (optional: reached customer's city)
  │   ↓
  │ delivered (customer received)
  │   ├→ returned
  │   └→ failed_delivery (auto-manual retry)
  │
  └→ failed_delivery (customer not available)
      └→ retry dispatch OR cancel
```

### Dispatch State Data Fields
When order moves to `dispatched`, capture:
- ✅ Tracking Number (mandatory)
- ✅ Courier Name (mandatory - TCS/Daraz/Leopards/etc)
- ✅ Estimated Delivery Date (mandatory)
- ✅ Dispatch Cost (mandatory - your cost to courier)

### In-Transit State (Optional)
- Trigger manually when courier confirms order reached customer's city
- Data: Which city, any notes

### Failed Delivery State
- Trigger manually when courier reports customer unavailable
- Action: Manual retry (you decide when to re-dispatch)
- Can transition back to `dispatched` with new tracking

### Returned State
- Minimal tracking - just status, no additional fields needed
- Can be triggered anytime post-delivery

---

## **2. DASHBOARD LAYOUT** 📊

### Section 1: TODAY AT A GLANCE (Top Priority)
```
┌─────────────────────────────────────┐
│ 🔴 Pending: 5   💰 Revenue: PKR 125k │
│ 🟡 Confirmed: 8 📦 Low Stock: 2 items│
│ 🟢 Dispatched: 12                    │
└─────────────────────────────────────┘
```
- KPI cards showing critical metrics
- Revenue = Confirmed + Delivered orders only
- Low stock = items ≤5 units with "Restock" button

### Section 2: PENDING ORDERS (Table View)
```
Table Columns:
- Checkbox (for bulk select)
- Customer Name | Phone
- Product | Quantity
- Amount (Total)
- City
- Status
- Quick Action Buttons (Confirm, Details, Delete)
```
- Rows clickable for full detail modal
- Show "Repeat Customer" badge if 2+ past orders
- Show past order history in hover tooltip (if possible)
- Mobile: Convert table to cards

### Section 3: STOCK STATUS (Inline Editing)
```
For each product variant:
[Product Name] ────────── [Current Qty] [Edit ↓/↑] [Save]
```
- Show all variants in simple list
- Click any number → becomes editable input
- Save button appears on focus
- Red highlight if ≤5 units with "LOW" label
- "Restock All Low Items" bulk button

### Section 4: REVENUE CHART
- 7-day bar chart
- Show: Confirmed + Delivered revenue only
- Tooltip on hover: Date, Amount, Count of orders

### Section 5: REPORTS (Below fold)
- **Revenue Trends:** Daily/Weekly/Monthly selector
- **Top Selling Products:** This month's best sellers (units + revenue)
- **City-wise Orders:** How many orders from each city (Karachi, Lahore, Islamabad, etc)

---

## **3. ORDER OPERATIONS** ⚙️

### Manual Order Creation Form
```
[Essential Fields - Always Show]
- Product (dropdown of all variants)
- Customer Name
- Phone Number
- City (dropdown)
- Quantity
- Unit Price (EDITABLE - prices may change, let user override)

[Calculate Automatically]
- Total = Unit Price × Quantity (auto-update as user types)

[Optional]
- Address (textarea)
- Notes (for internal use only - don't show as alert)
```
- On Phone blur → Search past customers, show "Last order was X"
- If customer found → Show "Repeat Customer" badge
- Show past order history in collapsible section

### Confirm Order Action
```
Click "Confirm" →
1. Check stock (warn if <qty, allow anyway)
2. Reserve stock automatically
3. Record as "confirmed"
4. Show toast: "Order confirmed"
5. Optionally send WhatsApp (NOT auto - let you choose)
```

### Dispatch Order Action
```
Open dispatch modal:
- Tracking Number (text input)
- Courier Name (dropdown)
- Estimated Delivery Date (date picker)
- Dispatch Cost (number)

Click "Dispatch" →
1. Save all tracking info
2. Update order status to "dispatched"
3. Show toast: "Dispatched!"
4. Optionally send WhatsApp with tracking (NOT auto)
   Template: "Order dispatched via [Courier], Tracking: [#], Arriving in [ETA]"
```

### Edit Confirmed Orders
- ✅ Allow FULL EDIT anytime (name, phone, address, city, product, qty, price)
- When changed → Add to audit log: "Changed by [user] at [time]"

### Bulk Actions
- ✅ Select multiple orders → "Confirm All" button
- ✅ Select multiple orders → "Mark Delivered" button
- ✅ Bulk confirm sets all to "confirmed" status in one click

---

## **4. AUTOMATION** 🤖

### WhatsApp Messages (NOT AUTOMATIC)
**You must CHOOSE to send each message:**

**On Confirmed:**
Button: "Send WhatsApp Confirmation"
- Message template: "Order confirmed! We will dispatch tomorrow. Tracking: [to be added]"
- Send to: Customer phone number

**On Dispatched:**
Button: "Send WhatsApp Dispatch"
- Message template: "Order dispatched! 📦 Courier: [TCS], Tracking: [#], Arriving in [ETA]"
- Send to: Customer phone number

**No auto-send. Always manual.**

### Other Automations
- ✅ Total price auto-calculates as you type qty
- ✅ Stock validation warns if qty > available (but allows anyway)
- ✅ When status changes → audit log entry (who changed what, when)

---

## **5. PAYMENT SYSTEM** 💳

### COD Only (For Now)
- All orders = COD by default
- Add field: "Payment Status"
  - Options: Pending | Paid | Failed
  - Manually mark after collection
- Track in reports: "% COD payment collection rate"

---

## **6. STOCK MANAGEMENT** 📦

### Inline Editing (Fast, No Modals)
```
Product Name ──────────── Qty: [3] 🔴 LOW
                                  [Save]
```
- Click number → becomes text input
- Type new quantity
- Click Save or press Enter
- Red highlight if ≤5
- "Restock All Low Items" button to do batch update modal

### Low Stock Alerts
- Red highlight in stock panel
- "LOW" badge on items ≤5
- Soft warning: "LOW STOCK: 2 items need restocking"
- Click warning → scroll to stock section

### Stock Safety
- ⚠️ Warn if order qty > available ("Only 3 in stock, allow anyway?")
- Allow confirmation anyway (no hard block)

---

## **7. MOBILE EXPERIENCE** 📱

- ✅ Full desktop functionality on mobile
- ✅ Pending orders: Convert table to cards for mobile view
- ✅ Stock panel: Vertical list, easy thumb-tap editing
- ✅ All modals: Mobile-optimized (full height, touch-friendly)
- ✅ Quick actions: Thumb-reachable buttons

---

## **8. REPEAT CUSTOMERS** 👥

### Repeat Customer Features
- Show "⭐ Repeat Customer" badge on order rows
- In detail view: Show "Previous Orders" collapsible section
  - List last 5 orders: Date, Product, Amount, Status
- On manual order: When phone auto-fills, show "This customer has X previous orders"

---

## **9. UNDO & AUDIT LOG** 🔄

❌ **REMOVED** — Not implemented (Firebase free tier optimization)
- No audit logging
- No undo functionality
- All changes are permanent once saved

---

## **10. FAILED DELIVERY WORKFLOW** 🚚

### Failed Delivery State
- When courier reports customer unavailable:
  1. Mark order as "failed_delivery"
  2. Add failure reason (optional note)
  3. Show "Retry Dispatch" button

### Manual Retry
- Click "Retry Dispatch"
- Opens dispatch modal again
- Set new tracking # + courier + ETA
- Status changes back to "dispatched"
- You can retry as many times as needed

### No Auto-Retry
- Stays in "failed_delivery" until you manually retry
- No auto-transition

---

## **11. REPORTING** 📈

### Revenue Trends
- Selector: Daily | Weekly | Monthly
- Show bar/line chart of revenue over time
- Only count: Confirmed + Delivered orders

### Top Selling Products
- This Month's ranking:
  - Rank | Product Name | Units Sold | Revenue
  - Sorted by units sold (descending)

### City-wise Order Distribution
- Table: City | Order Count | Revenue | % of Total
- Top cities highlighted
- Helps with logistics planning

---

## **12. ORDER DETAIL MODAL** 📋

### Customer Section
- Name | Phone | City | Address | Payment Status
- Show "⭐ Repeat Customer" badge here
- "Previous Orders" collapsible showing history

### Order Section
- Product | Quantity | Unit Price (editable) | Total
- All fields editable (full edit anytime)

### Dispatch Section (if dispatched)
- Tracking #
- Courier Name
- Estimated Delivery Date
- Dispatch Cost
- All editable

### Status & Actions
- Current status badge
- Available transition buttons (based on current state)
- "Send WhatsApp" buttons (optional, manual)
- Delete button (with confirmation)

### Audit Log
❌ Not implemented

---

## **13. NOTES FIELD** 📝

- ✅ Notes exist for your use (internal reminders)
- ❌ Don't show as "NOTE" badge/alert on order rows
- ❌ Don't auto-expand or warn on keywords
- Just show plain note field in detail modal

---

## **14. PRICE EDITING** 💰

### Flexible Pricing
- Unit price shown on manual order form (default from catalog)
- User can override price before confirming
- Total auto-calculates
- Useful when you run promotions or negotiate with customer

---

## **15. DATA PERSISTENCE**

### All Data
- Order info: Firestore (existing)
- Stock: Firestore (existing)
- ❌ No audit log (Firebase free tier optimization)

---

## **IMPLEMENTATION PRIORITIES**

### Phase 1 (Critical - This Week)
- [ ] Add order states (pending, confirmed, dispatched, in_transit, failed_delivery, returned)
- [ ] Add dispatch data fields (tracking, courier, ETA, cost)
- [ ] Reorganize dashboard (Today at a Glance, Pending Table, Stock Panel, Revenue Chart)
- [ ] Inline stock editing
- [ ] Manual dispatch modal

### Phase 2 (Important - Next Week)
- [ ] Repeat customer badge + history
- [ ] Bulk confirm + bulk mark delivered
- [ ] Payment status field (COD Paid/Pending)
- [ ] WhatsApp send buttons (manual, not auto)
- [ ] Reports (Revenue Trends, Top Products, City-wise)

### Phase 3 (Nice-to-Have - Following Week)
- [ ] Failed delivery retry workflow
- [ ] Mobile optimization
- [ ] Advanced reporting filters

---

## **NOTES**

- ✅ COD only for now
- ✅ No signature/OTP proof needed
- ✅ Prices may change — keep editable
- ✅ Notes are internal — don't alert users
- ✅ All WhatsApp messages are manual — never auto-send
- ✅ Full edit permission anytime — trust user to not break things
- ✅ Stock warnings only — no hard blocks
- ✅ Failed delivery is manual process — you decide retry timing
- ✅ NO AUDIT LOG — Firebase free tier (no extra writes for logging)
