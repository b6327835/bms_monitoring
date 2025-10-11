import React from 'react';

function FaultyEquipmentPanel({ faultyEquipment, onOpenFaultyEquipment }) {
  if (faultyEquipment.length === 0) {
    return null; // Don't show if no faulty equipment
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: '22px',
      right: '22px',
      zIndex: 5,
      background: 'rgba(220, 38, 38, 0.4)',
      border: '3px solid rgba(153, 27, 27, 0.5)',
      borderRadius: '9px',
      padding: '11px',
      maxWidth: '338px',
      boxShadow: '0 5px 22px rgba(220, 38, 38, 0.4)',
      animation: 'subtlePulse 3s infinite'
    }}>
      <div style={{
        color: 'white',
        fontWeight: 900,
        fontSize: '16px',
        marginBottom: '9px',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        ⚠️ ALERT: {faultyEquipment.length} Faulty Equipment{faultyEquipment.length > 1 ? 's' : ''}
      </div>
      
      <div style={{
        maxHeight: '270px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#fca5a5 #dc2626'
      }}>
        {faultyEquipment.map((item, index) => (
          <div key={`${item.type}-${item.id}`} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '5px',
            padding: '9px',
            marginBottom: '5px',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onClick={() => onOpenFaultyEquipment && onOpenFaultyEquipment(item)}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <div style={{
              color: 'white',
              fontWeight: 800,
              fontSize: '15px',
              marginBottom: '3px'
            }}>
              {item.type}: {item.name}
            </div>
            <div style={{
              color: '#fed7d7',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Status: {item.status}</span>
              {item.alert && item.alert !== 'None' && (
                <span>Alert: {item.alert}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <style>
        {`
          @keyframes subtlePulse {
            0%, 100% { box-shadow: 0 5px 22px rgba(220, 38, 38, 0.4); }
            50% { box-shadow: 0 5px 22px rgba(220, 38, 38, 0.6); }
          }
        `}
      </style>
    </div>
  );
}

export default FaultyEquipmentPanel;
