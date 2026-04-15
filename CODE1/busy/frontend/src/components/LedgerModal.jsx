import React, { useState, useEffect } from "react";
import { API, fetchJSON, fmt } from "../utils/api";
import Spinner from "./Spinner";

export default function LedgerModal({ customerId, customerName, onClose }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const data = await fetchJSON(`${API}/ledger/${customerId}`);

      // Expect backend to send:
      // { date, voucher_type, ref_id, debit, credit, balance, dr_cr }

      const normalized = data.map(e => ({
        ...e,
        debit: Number(e.debit) || 0,
        credit: Number(e.credit) || 0,
        balance: Number(e.balance) || 0,
        dr_cr: e.dr_cr || (e.balance >= 0 ? "Dr" : "Cr")
      }));

      setEntries(normalized);
    } catch (e) {
      console.error(e);
      alert("Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchLedger();
  }, [customerId]);

  const handlePayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) return;

    setIsPaying(true);
    try {
      await fetchJSON(`${API}/voucher/payment`, {
        method: "POST",
        body: JSON.stringify({
          party_id: customerId,
          amount: Number(payAmount),
          type: "RECEIPT", // BUSY-style voucher
        })
      });

      setPayAmount("");
      fetchLedger();
    } catch (e) {
      alert("Payment failed: " + e.message);
    } finally {
      setIsPaying(false);
    }
  };

  const renderVoucherLabel = (type) => {
    switch (type) {
      case "SALE": return "Invoice";
      case "RECEIPT": return "Payment";
      case "JOURNAL": return "Journal";
      case "OPENING": return "Opening";
      default: return type;
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal__header">
          <h2>📒 Ledger — {customerName}</h2>
          <button className="btn btn--icon" onClick={onClose}>✕</button>
        </div>

        {/* Payment Section */}
        <div className="payment-bar">
          <input
            type="number"
            placeholder="Enter amount..."
            value={payAmount}
            onChange={e => setPayAmount(e.target.value)}
          />
          <button
            className="btn btn--primary"
            onClick={handlePayment}
            disabled={isPaying || !payAmount}
          >
            {isPaying ? "Processing..." : "Receive Payment"}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="modal__center"><Spinner /></div>
        ) : entries.length === 0 ? (
          <p className="empty">No ledger entries</p>
        ) : (
          <div className="table-wrap">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Voucher</th>
                  <th>Ref No</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                </tr>
              </thead>

              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td>
                      {new Date(e.date).toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      <span className={`badge badge--${e.voucher_type}`}>
                        {renderVoucherLabel(e.voucher_type)}
                      </span>
                    </td>

                    <td>{e.ref_id ? `#${e.ref_id}` : "-"}</td>

                    <td className="num debit">
                      {e.debit ? fmt(e.debit) : "-"}
                    </td>

                    <td className="num credit">
                      {e.credit ? fmt(e.credit) : "-"}
                    </td>

                    <td className="num balance">
                      {fmt(Math.abs(e.balance))}{" "}
                      <span className={e.dr_cr === "Dr" ? "dr" : "cr"}>
                        {e.dr_cr}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}