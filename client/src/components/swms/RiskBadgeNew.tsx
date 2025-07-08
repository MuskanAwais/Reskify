import React from 'react';

interface RiskBadgeProps {
  level: 'extreme' | 'high' | 'medium' | 'low';
  score?: number;
  className?: string;
}

export const RiskBadgeNew: React.FC<RiskBadgeProps> = ({ 
  level, 
  score, 
  className = "" 
}) => {
  const getBackgroundColor = () => {
    switch (level) {
      case 'extreme':
        return '#dc2626'; // red-600
      case 'high':
        return '#ea580c'; // orange-600
      case 'medium':
        return '#eab308'; // yellow-500
      case 'low':
        return '#22c55e'; // green-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const getText = () => {
    const baseText = level.charAt(0).toUpperCase() + level.slice(1);
    return score ? `${baseText} (${score})` : baseText;
  };

  return (
    <span
      className={`risk-badge-override inline-flex items-center justify-center text-white font-medium text-xs px-2 py-1 rounded ${className}`}
      style={{
        backgroundColor: getBackgroundColor(),
        minWidth: '70px',
        height: '24px',
        fontSize: '10px',
        fontWeight: '500',
        fontFamily: 'Inter, Arial, sans-serif',
        lineHeight: '1',
        whiteSpace: 'nowrap',
        textAlign: 'center'
      }}
    >
      {getText()}
    </span>
  );
};