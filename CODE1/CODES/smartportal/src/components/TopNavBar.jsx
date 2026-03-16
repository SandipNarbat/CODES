import React, { useState } from 'react';
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

// Simple chart icon SVG
const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="8" y1="12" x2="8" y2="16"></line>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="16" y1="10" x2="16" y2="16"></line>
  </svg>
);

export default function TopNavBar() {
  const [marketDate, setMarketDate] = useState("2025-11-17");

  const formattedMarketDate = marketDate.replace(/-/g, ""); // e.g. 20251117

  return (
    <div className="top-navbar-container">
      {/* Top Tabs Row */}
      <div className="top-nav-tabs-row">
        <div className="tabs-left">
          <div className="logo-container">
            <img src={logo} alt="Company Logo" className="nav-logo" />
          </div>
          <div className="tab active">Dashboard</div>
          <div className="tab">We Are in PR</div>
          <div className="tab">Enquiry In DR</div>
          <div className="tab">Night Region</div>
          <div className="tab">CBS Flow</div>
          <div className="tab">Legends</div>
          <div className="tab">BRANCH TELLER INTERVAL</div>
          <div className="tab">MILESTONE DETAILS</div>

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

      {/* Health Indicators Toggle Card */}


      {/* Metric Badges / Buttons Rows */}
      <div className="metrics-badges-container">
        <div className="badges-row">
          <div className="badge dark">Branch logged in: <strong>25242</strong></div>
          <div className="badge dark border-right">Teller logged in: <strong>130820</strong></div>
          <div className="badge light">TXN DESC</div>
          <div className="badge light">ALL FILES</div>
          <div className="badge light">UPI(MR)</div>
          <div className="badge light outline-red outline">
            <span className="text-red">NEFT Invalid (D/N): <strong>0/0</strong></span>
          </div>
          <div className="badge light">REPOSTING STATUS</div>
          <div className="badge light outline-orange outline">
            <span className="text-orange">Repost Fail: <strong>0</strong></span>
          </div>
          <div className="badge light">RTGS INCOMING GATEWAY</div>
          <div className="badge light">RTGS INCOMING ACK C54</div>
        </div>
      </div>
    </div>
  );
}
