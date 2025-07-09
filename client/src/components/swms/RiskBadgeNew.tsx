import React from 'react';
import { Badge } from '@/components/ui/badge';

interface RiskBadgeNewProps {
  risk: string;
  className?: string;
}

const RiskBadgeNew: React.FC<RiskBadgeNewProps> = ({ risk, className = '' }) => {
  const getRiskColor = (riskLevel: string) => {
    const level = riskLevel.toLowerCase();
    
    switch (level) {
      case 'extreme':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'high':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      case 'medium':
        return 'bg-yellow-500 text-black hover:bg-yellow-600';
      case 'low':
        return 'bg-green-500 text-white hover:bg-green-600';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  return (
    <Badge className={`${getRiskColor(risk)} ${className}`}>
      {risk}
    </Badge>
  );
};

export default RiskBadgeNew;