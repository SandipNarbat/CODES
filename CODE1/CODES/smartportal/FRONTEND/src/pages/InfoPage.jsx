import React from 'react';
import { useParams } from 'react-router-dom';
import InfoPopup from './legend'; // InfoPopup is exported from legend.jsx

export default function InfoPage() {
  const { type } = useParams();

  // Map URL paths safely back to human-readable titles
  const titleMap = {
    'legend': 'Demo Legend',
    'cbs-flow': 'CBS Flow',
    'branch-teller-interval': 'Branch Teller Interval',
    'milestone-details': 'Milestone Details',
    'branch-logged-in': 'Branch Logged In',
    'teller-logged-in': 'Teller Logged In',
    'txn-desc': 'TXN DESC',
    'all-files': 'ALL FILES',
    'upi-mr': 'UPI (MR)',
    'neft-invalid': 'NEFT Invalid (D/N)',
    'reposting-status': 'Reposting Status',
    'repost-fail': 'Repost Fail',
    'rtgs-incoming-gateway': 'RTGS Incoming Gateway',
    'rtgs-incoming-ack': 'RTGS Incoming ACK C54'
  };

  const title = titleMap[type] || 'Information';

  // Omit onClose prop so it renders as standalone page
  return <InfoPopup title={title} />;
}
