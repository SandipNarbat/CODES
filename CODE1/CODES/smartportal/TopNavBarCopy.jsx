import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Component 2.png';
import './TopNavBar.css';
// Simple calendar icon SVG
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
export default function TopNavBar() {
  const [marketDate, setMarketDate] = React.useState("2025-11-17");
  const [branchCount, setBranchCount] = React.useState("25242");
  const [tellerCount, setTellerCount] = React.useState("130820");
  const navigate = useNavigate();
  const location = useLocation();
  React.useEffect(() => {
    const connectToSource = (source, setStateFn, keyName) => {
      let es;
      let reconnectTimer;
      
      const connect = (retry = 0) => {
        es = new EventSource(`http://localhost:8000/events/${source}`);
        es.onerror = () => {
          es.close();
          const timeout = Math.min(5000, 1000 * (retry + 1));
          reconnectTimer = setTimeout(() => {
            connect(retry + 1);
          }, timeout);
        };
        es.addEventListener("snapshot", (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data && data[keyName] !== undefined) {
              setStateFn(data[keyName]);
            }
          } catch (err) {
            console.error(`Error parsing snapshot for ${source}:`, err);
          }
        });
        es.addEventListener("delta", (e) => {
          try {
            const delta = JSON.parse(e.data);
            if (delta.type === "new" && delta.metrics !== undefined) {
              setStateFn(delta.metrics);
            } else if (delta.type === "update" && delta.changes && delta.changes.length > 0) {
              setStateFn(delta.changes[0].new);
            }
          } catch (err) {
            console.error(`Error parsing delta for ${source}:`, err);
          }
        });
      };
      connect();
      return () => {
        if (es) es.close();
        if (reconnectTimer) clearTimeout(reconnectTimer);
      };
    };
    const cleanupBranch = connectToSource("branchlogin", setBranchCount, "branch");
    const cleanupTeller = connectToSource("tellerlogin", setTellerCount, "teller");
    return () => {
      cleanupBranch();
      cleanupTeller();
    };
  }, []);
  const formattedMarketDate = marketDate.replace(/-/g, ""); // e.g. 20251117
  return (
    <div className="top-navbar-container">
      {/* Top Tabs Row */}
      <div className="top-nav-tabs-row">
        <div className="tabs-left">
          <div className="logo-container">
            <img src={logo} alt="Company Logo" className="nav-logo" />
          </div>
          <div className={`tab ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Dashboard</div>
          <div className="tab">We Are in PR</div>
          <div className="tab">Enquiry In DR</div>
          <div className="tab">Night Region</div>
          <div className={`tab ${location.pathname === '/cbs-flow' ? 'active' : ''}`} onClick={() => navigate('/cbs-flow')} style={{ cursor: 'pointer' }}>CBS Flow</div>
          <div className={`tab ${location.pathname === '/legend' ? 'active' : ''}`} onClick={() => navigate('/legend')} style={{ cursor: 'pointer' }}>Legends</div>
          <div className={`tab ${location.pathname === '/branch-teller-interval' ? 'active' : ''}`} onClick={() => navigate('/branch-teller-interval')} style={{ cursor: 'pointer' }}>BRANCH TELLER INTERVAL</div>
          <div className={`tab ${location.pathname === '/milestone-details' ? 'active' : ''}`} onClick={() => navigate('/milestone-details')} style={{ cursor: 'pointer' }}>MILESTONE DETAILS</div>
        </div>
        <div className="tabs-right">
          <div className="market-flag">
            <span className="flag-label">MFLAG</span>
            <span className="flag-date">{formattedMarketDate}</span>
          </div>
          <div className="date-picker-wrapper">
            <label htmlFor="market-date-picker" className="change-date-btn">
              <IconCalendar /> Change Date
            </label>
            <input
              type="date"
              id="market-date-picker"
              className="hidden-date-input"
              value={marketDate}
              onChange={(e) => setMarketDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* Metric Badges / Buttons Rows */}
      <div className="metrics-badges-container">
        <div className="badges-row">
          <div className={`badge dark ${location.pathname === '/branch-logged-in' ? 'active' : ''}`} onClick={() => navigate('/branch-logged-in')} style={{ cursor: 'pointer' }}>Branch logged in: <strong>25242</strong></div>
          <div className={`badge dark border-right ${location.pathname === '/teller-logged-in' ? 'active' : ''}`} onClick={() => navigate('/teller-logged-in')} style={{ cursor: 'pointer' }}>Teller logged in: <strong>130820</strong></div>
          <div className={`badge dark ${location.pathname === '/branch-logged-in' ? 'active' : ''}`} onClick={() => navigate('/branch-logged-in')} style={{ cursor: 'pointer' }}>Branch logged in: <strong>{branchCount}</strong></div>
          <div className={`badge dark border-right ${location.pathname === '/teller-logged-in' ? 'active' : ''}`} onClick={() => navigate('/teller-logged-in')} style={{ cursor: 'pointer' }}>Teller logged in: <strong>{tellerCount}</strong></div>
          <div className={`badge light ${location.pathname === '/txn-desc' ? 'active' : ''}`} onClick={() => navigate('/txn-desc')} style={{ cursor: 'pointer' }}>TXN DESC</div>
          <div className={`badge light ${location.pathname === '/all-files' ? 'active' : ''}`} onClick={() => navigate('/all-files')} style={{ cursor: 'pointer' }}>ALL FILES</div>
          <div className={`badge light ${location.pathname === '/upi-mr' ? 'active' : ''}`} onClick={() => navigate('/upi-mr')} style={{ cursor: 'pointer' }}>UPI(MR)</div>
          <div className={`badge light outline-red outline ${location.pathname === '/neft-invalid' ? 'active' : ''}`} onClick={() => navigate('/neft-invalid')} style={{ cursor: 'pointer' }}>
            <span className="text-red">NEFT Invalid (D/N): <strong>0/0</strong></span>
          </div>
          <div className={`badge light ${location.pathname === '/reposting-status' ? 'active' : ''}`} onClick={() => navigate('/reposting-status')} style={{ cursor: 'pointer' }}>REPOSTING STATUS</div>
          <div className={`badge light outline-orange outline ${location.pathname === '/repost-fail' ? 'active' : ''}`} onClick={() => navigate('/repost-fail')} style={{ cursor: 'pointer' }}>
            <span className="text-orange">Repost Fail: <strong>0</strong></span>
          </div>
          <div className={`badge light ${location.pathname === '/rtgs-incoming-gateway' ? 'active' : ''}`} onClick={() => navigate('/rtgs-incoming-gateway')} style={{ cursor: 'pointer' }}>RTGS INCOMING GATEWAY</div>
          <div className={`badge light ${location.pathname === '/rtgs-incoming-ack' ? 'active' : ''}`} onClick={() => navigate('/rtgs-incoming-ack')} style={{ cursor: 'pointer' }}>RTGS INCOMING ACK C54</div>
        </div>
      </div>
    </div>
  );
}
// hooks/usePagination.js

import { useMemo, useState } from "react";

export default function usePagination(data = [], pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    nextPage,
    prevPage,
    setCurrentPage
  };
}// components/Pagination.jsx

export default function Pagination({
  currentPage,
  totalPages,
  onNext,
  onPrev,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "15px",
      }}
    >
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <span>
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}


import usePagination from "./hooks/usePagination";
import Pagination from "./components/Pagination";

export default function MyTable() {

  const tableData = [
    { id: 1, name: "Server1" },
    { id: 2, name: "Server2" },
    { id: 3, name: "Server3" },
    // ...1000 rows
  ];

  const {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    prevPage
  } = usePagination(tableData, 10);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Server</th>
          </tr>
        </thead>

        <tbody>
          {paginatedData.map(row => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onNext={nextPage}
        onPrev={prevPage}
      />
    </>
  );
}






