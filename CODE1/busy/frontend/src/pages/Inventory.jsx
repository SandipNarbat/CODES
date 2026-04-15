import React, { useState } from "react";
import { API, fetchJSON, fmt } from "../utils/api";
import Spinner from "../components/Spinner";

export default function Inventory({ items, refreshItems, notify }) {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("0");
  const [newProductGst, setNewProductGst] = useState("18");
  const [loading, setLoading] = useState(false);

  return (
    <>
      {showAddProduct && (
        <div className="overlay" onClick={() => setShowAddProduct(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>📦 Add New Product</h2>
              <button className="btn btn--icon" onClick={() => setShowAddProduct(false)}>✕</button>
            </div>
            <div className="modal__body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="field">
                <label>Product Name</label>
                <input type="text" placeholder="e.g. Wire 4mm" value={newProductName} onChange={e => setNewProductName(e.target.value)} />
              </div>
              <div className="field-row">
                <div className="field" style={{ flex: 1 }}>
                  <label>Price (MRP)</label>
                  <input type="number" placeholder="0.00" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>GST Rate (%)</label>
                  <input type="number" placeholder="18" value={newProductGst} onChange={e => setNewProductGst(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Initial Stock Qty</label>
                <input type="number" placeholder="0" value={newProductStock} onChange={e => setNewProductStock(e.target.value)} />
              </div>
            </div>
            
            <div className="modal__footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn--primary" 
                disabled={loading || !newProductName || !newProductPrice}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const res = await fetchJSON(`${API}/items`, {
                      method: "POST",
                      body: JSON.stringify({
                        name: newProductName,
                        price: Number(newProductPrice),
                        stock_qty: Number(newProductStock),
                        gst_rate: Number(newProductGst)
                      })
                    });
                    refreshItems();
                    setShowAddProduct(false);
                    setNewProductName("");
                    setNewProductPrice("");
                    setNewProductStock("0");
                    setNewProductGst("18");
                    notify(`Product "${res.name}" added successfully!`);
                  } catch (e) {
                     notify(e.message, "error");
                  } finally {
                     setLoading(false);
                  }
                }}
              >
                {loading ? <Spinner /> : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Inventory</h1>
            <p className="page-sub">Live stock levels across all products</p>
          </div>
          <button className="btn btn--primary" onClick={() => setShowAddProduct(true)}>+ Add Product</button>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>MRP</th>
                  <th>GST Rate</th>
                  <th>MRP + GST</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const gstAmt = item.price * (item.gst_rate / 100);
                  const status =
                    item.stock_qty === 0
                      ? "out"
                      : item.stock_qty < 10
                      ? "low"
                      : "ok";
                  return (
                    <tr key={item.id}>
                      <td className="muted">{item.id}</td>
                      <td><strong>{item.name}</strong></td>
                      <td>{fmt(item.price)}</td>
                      <td>{item.gst_rate}%</td>
                      <td>{fmt(item.price + gstAmt)}</td>
                      <td>{item.stock_qty}</td>
                      <td>
                        <span className={`badge badge--stock-${status}`}>
                          {status === "ok" ? "In Stock" : status === "low" ? "Low" : "Out"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
