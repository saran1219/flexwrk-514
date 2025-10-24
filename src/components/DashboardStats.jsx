// src/components/DashboardStats.jsx

import React from 'react';

const DashboardStats = ({ stats, userType }) => {
  const getStatColor = (index) => {
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

  const getStatIcon = (key, userType) => {
    const iconMap = {
      // Client icons
      activeProjects: '🚀',
      completedProjects: '✅', 
      totalInvested: '💰',
      totalProposals: '📝',
      openJobs: '📢',
      
      // Freelancer icons
      earnings: '💵',
      projects: '📊',
      completedJobs: '✅',
      activeJobs: '🔥',
      clientsSatisfied: '😊',
      avgHourlyRate: '⏰',
      totalHours: '🕒'
    };
    
    return iconMap[key] || '📊';
  };

  const formatValue = (value, key) => {
    if (typeof value === 'number') {
      switch (key) {
        case 'totalInvested':
        case 'earnings':
        case 'avgHourlyRate':
          return value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`;
        case 'totalHours':
          return `${value}h`;
        default:
          return value.toLocaleString();
      }
    }
    return value || '0';
  };

  const getStatLabel = (key) => {
    const labelMap = {
      activeProjects: 'Active Projects',
      completedProjects: 'Completed Projects',
      totalInvested: 'Total Invested',
      totalProposals: 'Proposals Received',
      openJobs: 'Open Job Postings',
      earnings: 'Total Earnings',
      projects: 'Total Projects',
      completedJobs: 'Completed Jobs',
      activeJobs: 'Active Jobs',
      clientsSatisfied: 'Happy Clients',
      avgHourlyRate: 'Avg Hourly Rate',
      totalHours: 'Total Hours'
    };
    
    return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2.5rem'
    }}>
      {Object.entries(stats).map(([key, value], index) => (
        <div
          key={key}
          style={{
            background: getStatColor(index),
            borderRadius: '20px',
            padding: '2rem',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            animation: `slideInUp 0.6s ease ${index * 0.1}s forwards`,
            opacity: 0
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-8px) scale(1.02)';
            e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
          }}
        >
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '60px',
            height: '60px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            animation: 'pulse 4s ease-in-out infinite',
            transform: 'rotate(45deg)'
          }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              animation: 'bounce 2s ease-in-out infinite'
            }}>
              {getStatIcon(key, userType)}
            </div>
            
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em'
            }}>
              {formatValue(value, key)}
            </div>
            
            <div style={{
              fontSize: '1rem',
              opacity: 0.9,
              fontWeight: '500',
              letterSpacing: '0.02em'
            }}>
              {getStatLabel(key)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;