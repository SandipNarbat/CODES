import React, { useState, useEffect, useCallback } from "react";
import "./index.css";
import { API, fetchJSON } from "./utils/api";
import Toast from "./components/Toast";
import Billing from "./pages/Billing";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [tab, setTab] = useState("billing"); // billing | inventory | customers

  const notify = (msg, type = "success") => setToast({ msg, type });

  useEffect(() => {
    Promise.all([
      fetchJSON(`${API}/customers`),
      fetchJSON(`${API}/items`),
    ])
      .then(([c, i]) => {
        setCustomers(c);
        setItems(i);
      })
      .catch(() => notify("Cannot reach backend. Is FastAPI running?", "error"));
  }, []);

  // Refetch customers when switching to the customers tab to ensure balances are fresh
  useEffect(() => {
    if (tab === "customers") {
      fetchJSON(`${API}/customers`).then(setCustomers).catch(() => {});
    }
  }, [tab]);

  const refreshItems = useCallback(() => {
    fetchJSON(`${API}/items`).then(setItems).catch(() => {});
  }, []);

  return (
    <>
      <Toast
        msg={toast.msg}
        type={toast.type}
        onClose={() => setToast({ msg: "", type: "success" })}
      />

      <div className="app">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar__brand">
            <span className="sidebar__icon">📱</span>
            <span className="sidebar__title">SmartBill</span>
          </div>
          <nav className="sidebar__nav">
            {[
              { id: "billing", icon: "🧾", label: "Billing" },
              { id: "inventory", icon: "📦", label: "Inventory" },
              { id: "customers", icon: "👥", label: "Customers" },
            ].map((item) => (
              <button
                key={item.id}
                className={`nav-item ${tab === item.id ? "nav-item--active" : ""}`}
                onClick={() => setTab(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar__footer">
            <span className="version-tag">v1.0 • Demo</span>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="main">
          {tab === "billing" && (
            <Billing 
              items={items} 
              customers={customers} 
              refreshItems={refreshItems} 
              notify={notify}
              setCustomers={setCustomers}
            />
          )}
          {tab === "inventory" && (
            <Inventory 
              items={items} 
              refreshItems={refreshItems} 
              notify={notify} 
            />
          )}
          {tab === "customers" && (
            <Customers 
              customers={customers} 
            />
          )}
        </main>
      </div>
    </>
  );
}