import React, { useEffect } from 'react';

export default function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  
  if (!msg) return null;
  return (
    <div className={`toast toast--${type}`}>
      <span>{msg}</span>
      <button className="toast__close" onClick={onClose}>✕</button>
    </div>
  );
}
