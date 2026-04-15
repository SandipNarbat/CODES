import React, { useState } from "react";
import LedgerModal from "../components/LedgerModal";
import { fmt } from "../utils/api";

export default function Customers({ customers }) {
  const [ledgerFor, setLedgerFor] = useState(null);

  return (
    <>
      {ledgerFor && (
        <LedgerModal
          customerId={ledgerFor.id}
          customerName={ledgerFor.name}
          onClose={() => setLedgerFor(null)}
        />
      )}

      <div className="content">
        <div className="page-header">
          <h1>Customers</h1>
          <p className="page-sub">Registered customer accounts list</p>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ID</th>
                  <th>Customer Name</th>
                  <th>Contact No.</th>
                  <th style={{ textAlign: "right" }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => setLedgerFor(c)}
                    style={{ cursor: "pointer" }}
                    title="Click to view ledger"
                  >
                    <td className="muted">{c.id}</td>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td>{c.phone || "—"}</td>
                    <td className="num" style={{ textAlign: "right" }}>
                      {fmt(c.balance || 0)}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>
                      <span className="muted">No customers found.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
