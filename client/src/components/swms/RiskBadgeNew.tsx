import React from 'react';

interface RiskBadgeNewProps {
  risk?: string;
  level?: string;
  score?: number;
  className?: string;
}

const RiskBadgeNew: React.FC<RiskBadgeNewProps> = ({ risk, level, score, className = '' }) => {
  const getBackgroundColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'extreme': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#22c55e';
    }
  };

  const riskLevel = String(level || risk || 'low');
  const capitalizedLevel = riskLevel ? riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) : 'Low';
  const displayText = score ? `${capitalizedLevel} (${score})` : capitalizedLevel;

  return (
    <span 
      className={`risk-badge-override ${className}`}
      style={{
        backgroundColor: getBackgroundColor(riskLevel),
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
        paddingTop: '3px'
      }}
      key={`badge-${Date.now()}-${Math.random()}`}
    >
      {displayText}
    </span>
  );
};

export default RiskBadgeNew;