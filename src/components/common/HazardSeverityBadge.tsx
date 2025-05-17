import React from 'react';
import { HazardSeverity } from '../../types';

interface HazardSeverityBadgeProps {
  severity: HazardSeverity;
  size?: 'sm' | 'md' | 'lg';
}

const HazardSeverityBadge: React.FC<HazardSeverityBadgeProps> = ({ 
  severity, 
  size = 'md' 
}) => {
  const getSeverityDetails = () => {
    switch (severity) {
      case HazardSeverity.LOW:
        return { label: 'Low', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      case HazardSeverity.MEDIUM:
        return { label: 'Medium', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
      case HazardSeverity.HIGH:
        return { label: 'High', bgColor: 'bg-orange-100', textColor: 'text-orange-800' };
      case HazardSeverity.CRITICAL:
        return { label: 'Critical', bgColor: 'bg-red-100', textColor: 'text-red-800' };
      default:
        return { label: 'Unknown', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const details = getSeverityDetails();

  return (
    <span 
      className={`inline-flex items-center font-medium rounded-full ${details.bgColor} ${details.textColor} ${sizeClasses[size]}`}
    >
      {details.label}
    </span>
  );
};

export default HazardSeverityBadge;