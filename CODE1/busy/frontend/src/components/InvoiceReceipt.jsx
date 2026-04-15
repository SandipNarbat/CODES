import React from "react";
import { fmt } from "../utils/api";

export default function InvoiceReceipt({ inv, cart, customers, onClose, onNew }) {
  return (
    <div className="overlay" style={{ overflowY: 'auto' }}>
      <div className="receipt invoice-redesign">
        {/* Header */}
        <div className="inv-header">
           <div className="inv-brand">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12l5.25 5L12 12l5.25 5L22 12M2 7l5.25 5L12 7l5.25 5L22 7"/></svg>
              <div>
                <h1>BRAND NAME</h1>
                <p>Maecenas dapibus quis ipsum</p>
              </div>
           </div>
           <div className="inv-title">
             INVOICE
           </div>
        </div>

        {/* Info Rows */}
        <div className="inv-info">
          <div className="inv-to">
             <div className="inv-to-label">Invoice to:</div>
             <strong>{inv.customer_name}</strong>
             <p>66 Avenue any street,<br/>City name, State, US</p>
          </div>
          <div className="inv-meta">
             <div className="meta-row"><span>Invoice #</span> <strong>{String(inv.invoice_id).padStart(6, '0')}</strong></div>
             <div className="meta-row"><span>Date</span> <strong>{new Date(inv.date).toLocaleDateString()}</strong></div>
          </div>
        </div>

        {/* Table */}
        <table className="inv-table">
          <thead>
             <tr>
               <th>ITEM DESCRIPTION</th>
               <th className="center">QTY</th>
               <th className="right">PRICE</th>
               <th className="right">TOTAL</th>
             </tr>
          </thead>
          <tbody>
             {cart.map((row, i) => (
                <tr key={i}>
                  <td>{row.item.name}</td>
                  <td className="center">{row.qty}</td>
                  <td className="right">{fmt(row.item.price)}</td>
                  <td className="right">{fmt(row.item.price * row.qty)}</td>
                </tr>
             ))}
          </tbody>
        </table>

        {/* Totals Box */}
        <div className="inv-totals-wrap">
           <div className="inv-totals-box">
             <div className="tot-row"><span>SUB TOTAL</span> <strong>{fmt(inv.total)}</strong></div>
             <div className="tot-row"><span>TAX (0%)</span> <strong>{fmt(inv.gst)}</strong></div>
           </div>
        </div>

        <div className="inv-bottom-blocks">
           <div className="inv-payment">
              <div className="yellow-header">PAYMENT METHOD</div>
              <div className="pay-details">
                <strong>Paypal</strong>
                <p>anyemail@domain.com</p>
                <strong style={{marginTop:'8px', display:'block'}}>Bank account</strong>
                <p>23-554-2785-54</p>
              </div>
              <p className="thank-you">Thank you for business with us!</p>
           </div>
           
           <div className="inv-grand">
              <div className="yellow-flex-header">
                 <span>GRAND TOTAL</span>
                 <span>{fmt(inv.grand_total)}</span>
              </div>
              <div className="signature-box">
                 <div className="sig">J.Smith</div>
                 <strong>MR. FREEMAN GOAL</strong>
                 <p>Executive director</p>
              </div>
           </div>
        </div>

        <div className="inv-footer">
           <div className="terms">
              <strong>TERMS:</strong>
              <p>Maecenas dapibus quis ipsum eu bibendum. Cras ullamcorper odio vitae.</p>
           </div>
           <div className="address">
              Address line can be here
           </div>
        </div>

        <div className="receipt__actions no-print" style={{ marginTop: '30px' }}>
          <button className="btn btn--outline" onClick={() => window.print()}>🖨 Print</button>
          <button className="btn btn--primary" onClick={onNew}>+ New Invoice</button>
          <button className="btn btn--ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
