// src/components/ActivityFeed.jsx

import React from 'react';

const ActivityFeed = ({ activities, title = "Recent Activity" }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      project: '📋',
      message: '💬',
      proposal: '📝',
      payment: '💰',
      review: '⭐',
      job: '💼',
      milestone: '🎯',
      delivery: '📦',
      hire: '🤝',
      complete: '✅',
      default: '📌'
    };
    return iconMap[type] || iconMap.default;
  };

  const getActivityColor = (type) => {
    const colorMap = {
      project: '#3b82f6',
      message: '#10b981',
      proposal: '#f59e0b',
      payment: '#059669',
      review: '#8b5cf6',
      job: '#ef4444',
      milestone: '#06b6d4',
      delivery: '#84cc16',
      hire: '#f97316',
      complete: '#22c55e',
      default: '#6b7280'
    };
    return colorMap[type] || colorMap.default;
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const activityDate = date.toDate ? date.toDate() : new Date(date);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return activityDate.toLocaleDateString();
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '2rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f1f5f9',
      height: 'fit-content'
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
          <span style={{ fontSize: '1.8rem' }}>📊</span>
          {title}
        </h3>
      </div>

      {activities.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📈</div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No Recent Activity</h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Your recent activities will appear here
          </p>
        </div>
      ) : (
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '0.5rem'
        }}>
          {activities.map((activity, index) => (
            <div
              key={activity.id || index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: index < activities.length - 1 ? '0.75rem' : 0,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                animation: `slideInUp 0.5s ease ${index * 0.1}s forwards`,
                opacity: 0
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${getActivityColor(activity.type)}20, ${getActivityColor(activity.type)}10)`,
                border: `2px solid ${getActivityColor(activity.type)}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0
              }}>
                {getActivityIcon(activity.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.25rem'
                }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {activity.title}
                  </h4>
                  <span style={{
                    fontSize: '0.8rem',
                    color: '#9ca3af',
                    flexShrink: 0,
                    marginLeft: '0.5rem'
                  }}>
                    {formatTimeAgo(activity.createdAt || activity.timestamp)}
                  </span>
                </div>

                <p style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  margin: '0 0 0.5rem 0',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  '-webkit-line-clamp': 2,
                  '-webkit-box-orient': 'vertical'
                }}>
                  {activity.description}
                </p>

                {activity.amount && (
                  <div style={{
                    display: 'inline-block',
                    background: getActivityColor(activity.type) + '20',
                    color: getActivityColor(activity.type),
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    ${activity.amount.toLocaleString()}
                  </div>
                )}

                {activity.status && (
                  <div style={{
                    display: 'inline-block',
                    background: getActivityColor(activity.type) + '20',
                    color: getActivityColor(activity.type),
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginLeft: activity.amount ? '0.5rem' : 0
                  }}>
                    {activity.status}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > 5 && (
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #f1f5f9'
        }}>
          <button style={{
            background: 'transparent',
            border: 'none',
            color: '#3b82f6',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: '600',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}>
            View All Activity →
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;