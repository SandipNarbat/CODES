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
  const navigate = useNavigate();
  const location = useLocation();

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
