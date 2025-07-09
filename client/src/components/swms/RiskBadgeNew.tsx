import React from 'react';

interface RiskBadgeProps {
  level: string;
  score: number;
}

export const RiskBadgeNew: React.FC<RiskBadgeProps> = ({ level, score }) => {
  const getBackgroundColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'extreme': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#22c55e';
    }
  };

  const capitalizedLevel = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Low';

  return (
    <span 
      className="risk-badge-override"
      style={{
        backgroundColor: getBackgroundColor(level),
        color: '#ffffff',
        height: '24px',
        width: '70px',
        fontSize: '10px',
        display: 'inline-block',
        textAlign: 'center',
        verticalAlign: 'top',
        borderRadius: '4px',
        fontWeight: '600',
        fontFamily: 'Inter, Arial, sans-serif',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        lineHeight: 1,
        paddingTop: '6px'
      }}
      key={`badge-${Date.now()}-${Math.random()}`}
    >
      {capitalizedLevel} ({score})
    </span>
  );
};