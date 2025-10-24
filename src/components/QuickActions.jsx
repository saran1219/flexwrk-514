// src/components/QuickActions.jsx

import React from 'react';

const QuickActions = ({ actions, title = "Quick Actions" }) => {
  const getActionColor = (index) => {
    const colors = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #a8edea, #fed6e3)'
    ];
    return colors[index % colors.length];
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '2rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f1f5f9'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1f2937',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.8rem' }}>⚡</span>
          {title}
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            style={{
              background: 'white',
              border: '2px solid #f1f5f9',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              animation: `slideInUp 0.5s ease ${index * 0.1}s forwards`,
              opacity: 0
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.1)';
              e.target.style.borderColor = action.color || '#3b82f6';
              e.target.style.background = `linear-gradient(135deg, ${action.color || '#3b82f6'}15, ${action.color || '#3b82f6'}05)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = '#f1f5f9';
              e.target.style.background = 'white';
            }}
          >
            <div style={{
              fontSize: '2.5rem',
              marginBottom: '1rem'
            }}>
              {action.icon}
            </div>
            
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 0.5rem 0'
            }}>
              {action.title}
            </h4>
            
            <p style={{
              fontSize: '0.9rem',
              color: '#6b7280',
              margin: 0,
              lineHeight: '1.4'
            }}>
              {action.description}
            </p>
            
            {/* Hover effect overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, ${action.color || '#3b82f6'}10, transparent)`,
              opacity: 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none'
            }} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;