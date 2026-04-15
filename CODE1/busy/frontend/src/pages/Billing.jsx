import React, { useState } from "react";
import { API, fetchJSON, fmt } from "../utils/api";
import Spinner from "../components/Spinner";
import InvoiceReceipt from "../components/InvoiceReceipt";

export default function Billing({ items, customers, refreshItems, notify, setCustomers }) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);

  const addToCart = () => {
    if (!selectedItem) return notify("Select a product first.", "error");
    if (qty < 1) return notify("Quantity must be at least 1.", "error");

    const item = items.find((i) => i.id === Number(selectedItem));
    if (!item) return;
    if (qty > item.stock_qty) {
      return notify(`Only ${item.stock_qty} units in stock.`, "error");
    }

    setCart((prev) => {
      const existing = prev.findIndex((r) => r.item.id === item.id);
      if (existing !== -1) {
        const updated = [...prev];
        const newQty = updated[existing].qty + Number(qty);
        if (newQty > item.stock_qty) {
          notify(`Stock limit: ${item.stock_qty} units.`, "error");
          return prev;
        }
        updated[existing] = { ...updated[existing], qty: newQty };
        return updated;
      }
      return [...prev, { item, qty: Number(qty) }];
    });
    setSelectedItem("");
    setQty(1);
  };

  const removeFromCart = (idx) =>
    setCart((prev) => prev.filter((_, i) => i !== idx));

  // Totals
  const subtotal = cart.reduce((s, r) => s + r.item.price * r.qty, 0);
  const gstTotal = cart.reduce((s, r) => s + r.item.price * r.qty * (r.item.gst_rate / 100), 0);
  const grandTotal = subtotal + gstTotal;

  // Generate invoice
  const generateInvoice = async () => {
    if (!customerName) return notify("Enter customer name first.", "error");
    if (cart.length === 0) return notify("Add at least one item.", "error");

    setLoading(true);
    try {
      const result = await fetchJSON(`${API}/invoice`, {
        method: "POST",
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone || null,
          items: cart.map((r) => ({ item_id: r.item.id, qty: r.qty })),
        }),
      });
      setInvoice(result);
      fetchJSON(`${API}/customers`).then(setCustomers).catch(() => {});
      refreshItems();
      notify(`Invoice #${result.invoice_id} created!`);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setSelectedItem("");
    setQty(1);
    setInvoice(null);
  };

  const selectedItemObj = items.find((i) => i.id === Number(selectedItem));

  return (
    <>
      {invoice && (
        <InvoiceReceipt
          inv={invoice}
          cart={cart}
          customers={customers}
          onClose={() => setInvoice(null)}
          onNew={resetAll}
        />
      )}
      <div className="content">
        <div className="page-header">
          <h1>New Invoice</h1>
          <p className="page-sub">Create a bill and auto-calculate GST</p>
        </div>

        <div className="billing-grid">
          {/* ── Left: form ── */}
          <div className="card">
            <h3 className="card__title">🧾 Bill Details</h3>

            {/* Customer Details */}
            <div className="field">
              <label>Customer Name *</label>
              <input
                type="text"
                placeholder="Enter customer name..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Mobile Number (Optional)</label>
              <input
                type="text"
                placeholder="Enter mobile number..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="divider" />

            {/* Add item row */}
            <div className="field">
              <label>Product</label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                <option value="">— Select product —</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id} disabled={i.stock_qty === 0}>
                    {i.name} — {fmt(i.price)} {i.stock_qty === 0 ? "(Out of stock)" : `(${i.stock_qty} left)`}
                  </option>
                ))}
              </select>
            </div>

            {selectedItemObj && (
              <div className="item-preview">
                <span>GST: {selectedItemObj.gst_rate}%</span>
                <span>Stock: {selectedItemObj.stock_qty} units</span>
                <span>MRP: {fmt(selectedItemObj.price)}</span>
              </div>
            )}

            <div className="field-row">
              <div className="field field--sm">
                <label>Qty</label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && addToCart()}
                />
              </div>
              <button className="btn btn--add" onClick={addToCart}>
                + Add Item
              </button>
            </div>
          </div>

          {/* ── Right: cart + totals ── */}
          <div className="cart-panel">
            <div className="card cart-card">
              <h3 className="card__title">🛒 Cart</h3>

              {cart.length === 0 ? (
                <div className="empty-cart">
                  <span>🛍</span>
                  <p>No items added yet</p>
                </div>
              ) : (
                <div className="cart-list">
                  {cart.map((row, idx) => {
                    const lineBase = row.item.price * row.qty;
                    const lineGst = lineBase * (row.item.gst_rate / 100);
                    return (
                      <div key={idx} className="cart-row">
                        <div className="cart-row__info">
                          <span className="cart-row__name">{row.item.name}</span>
                          <span className="cart-row__meta">
                            {row.qty} × {fmt(row.item.price)} · GST {row.item.gst_rate}%
                          </span>
                        </div>
                        <div className="cart-row__right">
                          <span className="cart-row__total">{fmt(lineBase + lineGst)}</span>
                          <button
                            className="btn btn--remove"
                            onClick={() => removeFromCart(idx)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="totals-card">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="totals-row">
                <span>GST</span>
                <span className="gst-amt">{fmt(gstTotal)}</span>
              </div>
              <div className="totals-row totals-row--grand">
                <span>Grand Total</span>
                <span>{fmt(grandTotal)}</span>
              </div>

              <button
                className="btn btn--generate"
                onClick={generateInvoice}
                disabled={loading || cart.length === 0 || !customerName}
              >
                {loading ? <Spinner /> : "⚡ Generate Invoice"}
              </button>

              {cart.length > 0 && (
                <button className="btn btn--ghost btn--block" onClick={resetAll}>
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
