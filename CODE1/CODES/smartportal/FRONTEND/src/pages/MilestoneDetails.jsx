import React, { useEffect } from 'react';

export default function MilestoneDetails({ onClose }) {
  const isStandalone = !onClose;

  // Standalone tab logic to broadcast its closure
  useEffect(() => {
    if (isStandalone) {
      const channel = new BroadcastChannel('popup_sync_channel');
      
      const handleBeforeUnload = () => {
        channel.postMessage({ type: 'TAB_CLOSED', path: '/milestone-details' });
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        channel.close();
      };
    }
  }, [isStandalone]);

  return (
    <div style={{
      position: isStandalone ? 'relative' : 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: isStandalone ? '#1e1e1e' : 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: isStandalone ? 'stretch' : 'center',
      justifyContent: isStandalone ? 'stretch' : 'center',
      zIndex: isStandalone ? 1 : 9999
    }}>
      <div style={{
        padding: '2rem', 
        fontFamily: 'sans-serif', 
        color: 'white', 
        backgroundColor: '#1e1e1e',
        borderRadius: isStandalone ? '0' : '8px',
        minWidth: '300px',
        maxWidth: isStandalone ? 'none' : '1200px',
        maxHeight: isStandalone ? 'none' : '600px',
        width: isStandalone ? '100%' : 'auto',
        boxShadow: isStandalone ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.3)',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ marginTop: 0 }}>Milestone Details</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
                {!isStandalone && (
                  <button 
                  onClick={() => {
                    window.open('/milestone-details', '_blank');
                    if (onClose) onClose();
                  }}
                  style={{
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                  }}
                  >
                  Open in New Tab
                  </button>
                )}
                {onClose ? (
                  <button 
                  onClick={onClose} 
                  style={{
                      padding: '10px 20px',
                      backgroundColor: '#cf3c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                  }}
                  >
                  Close
                  </button>
                ) : (
                  <button 
                  onClick={() => {
                    const channel = new BroadcastChannel('popup_sync_channel');
                    channel.postMessage({ type: 'TAB_CLOSED', path: '/milestone-details' });
                    channel.close();
                    window.close();
                  }} 
                  style={{
                      padding: '10px 20px',
                      backgroundColor: '#cf3c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                  }}
                  >
                  Close Tab
                  </button>
                )}
            </div>
        </div>
        <div style={{ marginTop: '1rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            <p>
              This is a placeholder for the <strong>Milestone Details</strong> explanation.<br/>
              Add your content here.
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit, rerum, omnis debitis at eveniet, repellendus inventore iure molestiae dolorem quo dolorum!
            </p>
        </div>
      </div>
    </div>
  );
}
