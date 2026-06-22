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


import './QueueAlerts.css';
import { IconAlertCircle, IconAlertTriangle } from '../components/Icons';
import React, { useMemo, useRef } from 'react';
import AlertPopup from './AlertPopup';


const QueueAlerts = ({ data }) => {
    const panelRef = useRef(null);

    const alertsList = useMemo(() => {
        if (!data) return [];

        return Object.keys(data).flatMap(key => {
            const array = data[key];
            if (!Array.isArray(array)) return [];

            return array
                .map((val, idx) => ({ val, idx }))
                .filter(item => item.val > 100)
                .map(item => ({
                    key: key,
                    value: item.val,
                    serverIndex: item.idx,
                    isCritical: item.val >= 500
                }));
        }).sort((a, b) => b.value - a.value);
    }, [data]);

    const totalAlerts = alertsList.length;
    const criticalCount = alertsList.filter(a => a.value >= 500).length;
    const highCount = alertsList.filter(a => a.value > 100 && a.value < 500).length;

    // Scroll the queue panel into view when bell is clicked
    const handleBellOpen = () => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (totalAlerts === 0) {
        return null;
    }

    return (
        <>
            {/* Floating popup + bell — rendered outside the panel via portal-like fixed positioning */}
            <AlertPopup
                totalAlerts={totalAlerts}
                criticalCount={criticalCount}
                highCount={highCount}
                onOpen={handleBellOpen}
            />

            {/* Existing queue alert panel */}
            <div className="queue-alert" ref={panelRef}>
                <div className="upper-queue">
                    <h1>QUEUE BUILDUP ALERTS</h1>
                </div>

                <div className="middle-queue">
                    <div className="total-que red">
                        <h2>{totalAlerts}</h2>
                        <p className='white'>TOTAL ALERTS</p>
                    </div>

                    <div className='line'></div>

                    <div className="que-block">
                        <div className="icon"><IconAlertTriangle /></div>
                        <div className='middle-block red'>
                            <h2>{criticalCount}</h2>
                            <p>CRITICAL</p>
                            <p className='white'>{"> 500"}</p>
                        </div>
                    </div>

                    <div className='line'></div>

                    <div className="que-block">
                        <div className="icon"><IconAlertCircle /></div>
                        <div className='middle-block orange'>
                            <h2>{highCount}</h2>
                            <p>HIGH</p>
                            <p className='white'>{"200 - 499"}</p>
                        </div>
                    </div>
                </div>

                <div className="lower-queue">
                    <p>TOP QUEUE BUILDUPS</p>
                    <div className="queue-tiles">
                        {alertsList.map((alert, index) => {
                            const { key, value, serverIndex, isCritical } = alert;

                            const tileClass = isCritical ? 'tile-red' : 'tile-orange';
                            const serverClass = isCritical ? 'server-red' : 'server-orange';
                            const uniqueKey = `${key}-${serverIndex}-${index}`;

                            return (
                                <div key={uniqueKey} className={`tile ${tileClass}`}>
                                    <div className='tile-'>
                                        <h3>{key}</h3>
                                        <h3 className={serverClass}>{serverIndex === 0 ? 'M' : `S${serverIndex}`}</h3>
                                    </div>
                                    <h1>{value}</h1>
                                </div>
                            );
                        })}

                        {alertsList.length === 0 && (
                            <p style={{ color: 'green' }}>No alerts found.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default QueueAlerts;




import React, { useState, useEffect, useRef } from 'react';
import './AlertPopup.css';

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const AlertPopup = ({ totalAlerts, criticalCount, highCount, onOpen }) => {
  const [visible, setVisible] = useState(false);     // popup toast visible
  const [collapsed, setCollapsed] = useState(false); // collapsed into bell button
  const [prevTotal, setPrevTotal] = useState(totalAlerts);
  const timerRef = useRef(null);

  // Trigger popup whenever alert count changes (and > 0)
  useEffect(() => {
    if (totalAlerts > 0 && totalAlerts !== prevTotal) {
      showPopup();
    }
    // Also show on first load if there are alerts
    if (prevTotal === 0 && totalAlerts > 0 && !visible && !collapsed) {
      showPopup();
    }
    setPrevTotal(totalAlerts);
  }, [totalAlerts]);

  // Show on mount if alerts exist
  useEffect(() => {
    if (totalAlerts > 0) {
      showPopup();
    }
  }, []);

  const showPopup = () => {
    setCollapsed(false);
    setVisible(true);
    clearTimeout(timerRef.current);
    // Auto-dismiss after 5 seconds → collapse into bell
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setCollapsed(true);
    }, 5000);
  };

  const handleDismiss = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
    setCollapsed(true);
  };

  const handleBellClick = () => {
    setCollapsed(false);
    if (onOpen) onOpen(); // optionally scroll/open full panel
    showPopup();
  };

  if (totalAlerts === 0) return null;

  return (
    <>
      {/* Toast Popup */}
      <div className={`alert-popup ${visible ? 'popup-enter' : 'popup-exit'}`}>
        <div className="popup-header">
          <span className="popup-title">⚠ Queue Buildup Alerts</span>
          <button className="popup-close" onClick={handleDismiss}>✕</button>
        </div>

        <div className="popup-body">
          <div className="popup-stat total">
            <span className="stat-num">{totalAlerts}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="popup-divider" />
          <div className="popup-stat critical">
            <span className="stat-num">{criticalCount}</span>
            <span className="stat-label">Critical</span>
          </div>
          <div className="popup-divider" />
          <div className="popup-stat high">
            <span className="stat-num">{highCount}</span>
            <span className="stat-label">High</span>
          </div>
        </div>

        <div className="popup-footer">
          <div className="popup-timer-bar" />
          <span className="popup-hint">Dismissing in 5s…</span>
        </div>
      </div>

      {/* Bell button — shown after popup collapses */}
      {collapsed && (
        <button className="alert-bell-btn" onClick={handleBellClick} title="View alerts">
          <BellIcon />
          <span className="bell-badge">{totalAlerts}</span>
        </button>
      )}
    </>
  );
};

export default AlertPopup;


/* ── Popup Toast ─────────────────────────────────────── */
.alert-popup {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  width: 320px;
  background: #1a1a2e;
  border: 1px solid #e74c3c;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(231, 76, 60, 0.25);
  overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.35s ease;
}

.popup-enter {
  transform: translateX(0);
  opacity: 1;
}

.popup-exit {
  transform: translateX(360px);
  opacity: 0;
  pointer-events: none;
}

/* Header */
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #e74c3c;
}

.popup-title {
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.popup-close {
  background: none;
  border: none;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  font-size: 14px;
  padding: 0 2px;
  line-height: 1;
  transition: color 0.2s;
}
.popup-close:hover { color: #fff; }

/* Body stats */
.popup-body {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16px 12px;
  gap: 8px;
}

.popup-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.stat-num {
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #aaa;
}

.popup-stat.total .stat-num    { color: #e74c3c; }
.popup-stat.critical .stat-num { color: #ff6b6b; }
.popup-stat.high .stat-num     { color: #f39c12; }

.popup-divider {
  width: 1px;
  height: 36px;
  background: rgba(255,255,255,0.1);
}

/* Footer timer */
.popup-footer {
  padding: 0 14px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.popup-timer-bar {
  flex: 1;
  height: 3px;
  background: #e74c3c;
  border-radius: 2px;
  animation: shrink 5s linear forwards;
}

@keyframes shrink {
  from { transform: scaleX(1); transform-origin: left; }
  to   { transform: scaleX(0); transform-origin: left; }
}

.popup-hint {
  font-size: 10px;
  color: #666;
  white-space: nowrap;
}

/* ── Bell Button ──────────────────────────────────────── */
.alert-bell-btn {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  width: 46px;
  height: 46px;
  background: #1a1a2e;
  border: 1px solid #e74c3c;
  border-radius: 50%;
  color: #e74c3c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(231, 76, 60, 0.3);
  transition: background 0.2s, transform 0.2s;
  animation: bell-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.alert-bell-btn:hover {
  background: #e74c3c;
  color: #fff;
  transform: scale(1.08);
}

@keyframes bell-pop {
  from { transform: scale(0.4); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.bell-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #e74c3c;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #1a1a2e;
}


while true
do
echo "running"
dt=`cut -c 9-16 $ddata/file/MFLAGS`

scp -P 3000 $npdata/gateway_${BANCS_DQPTYPE}.txt smartportal02@10.177.194.138:/home/smartportal02/portal_data/gateway_${BANCS_DQPTYPE}.txt.$dt
scp -P 3000 $HOME/pace/tf_pen_pro_${BANCS_DQPTYPE}.txt smartportal02@10.177.194.138:/home/smartportal02/portal_data/tf_pen_pro_${BANCS_DQPTYPE}.txt_$dt
scp -P 3000 /home/fnsonlid/queue_buildup_${BANCS_DQPTYPE}.txt smartportal02@10.177.194.138:/home/smartportal02/portal_data/queue_buildup_${BANCS_DQPTYPE}.txt.$dt
scp -P 3000 $HOME/pace/top_m.txt smartportal02@10.177.194.138:/home/smartportal02/portal_data/top_m.txt.$dt
scp -P 3000 $HOME/pace/topstat_m.txt smartportal02@10.177.194.138:/home/smartportal02/portal_data/topstat_m.txt.$dt
scp -P 3000 $HOME/pace/space_m.txt smartportal02@10.177.194.138:/home/smartportal02/portal_data/space_m.txt.$dt
scp -P 3000 $HOME/pace/rtgs_incoming_rbi_flag_${BANCS_DQPTYPE}.txt smartportal02@10.177.194.138:/home/smartportal02/portal_data/rtgs_incoming_rbi_flag_${BANCS_DQPTYPE}.txt.$dt
scp -P 3000 $HOME/pace/rtgs_outgoing_psg_${BANCS_DQPTYPE}.txt smartportal02@10.177.194.138:/home/smartportal02/portal_data/rtgs_outgoing_psg_${BANCS_DQPTYPE}.txt.$dt
scp -P 3000 $HOME/pace/ocr_neft_m.txt smartportal02@10.177.194.138:/home/smartportal02/portal_data/ocr_neft_m.txt.$dt
scp -P 3000 $HOME/pace/prod_teller_logged.txt smartportal02@10.177.194.138:/home/smartportal02/portal_data/prod_teller_logged.txt.$dt
scp -P 3000 $HOME/pace/trn_stat_m.txt smartportal02@10.177.194.138:/home/smartportal02/portal_data/trn_stat_m.txt.$dt

sleep 10
done






