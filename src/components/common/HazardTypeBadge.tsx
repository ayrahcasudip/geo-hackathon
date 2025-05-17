import React from 'react';
import { 
  Flame, Cloud, Waves, Mountain, Zap, HelpCircle
} from 'lucide-react';
import { HazardType } from '../../types';

interface HazardTypeBadgeProps {
  type: HazardType;
  withLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const HazardTypeBadge: React.FC<HazardTypeBadgeProps> = ({ 
  type, 
  withLabel = true,
  size = 'md'
}) => {
  const getHazardTypeDetails = () => {
    switch (type) {
      case HazardType.FIRE:
        return { 
          icon: <Flame className="h-4 w-4" />, 
          label: 'Fire',
          bgColor: 'bg-red-100', 
          textColor: 'text-red-800' 
        };
      case HazardType.FLOOD:
        return { 
          icon: <Waves className="h-4 w-4" />, 
          label: 'Flood',
          bgColor: 'bg-blue-100', 
          textColor: 'text-blue-800' 
        };
      case HazardType.STORM:
        return { 
          icon: <Cloud className="h-4 w-4" />, 
          label: 'Storm',
          bgColor: 'bg-indigo-100', 
          textColor: 'text-indigo-800' 
        };
      case HazardType.LANDSLIDE:
        return { 
          icon: <Mountain className="h-4 w-4" />, 
          label: 'Landslide',
          bgColor: 'bg-amber-100', 
          textColor: 'text-amber-800' 
        };
      case HazardType.EARTHQUAKE:
        return { 
          icon: <Zap className="h-4 w-4" />, 
          label: 'Earthquake',
          bgColor: 'bg-purple-100', 
          textColor: 'text-purple-800' 
        };
      default:
        return { 
          icon: <HelpCircle className="h-4 w-4" />, 
          label: 'Other',
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-800' 
        };
    }
  };

  const sizeClasses = {
    sm: 'text-xs gap-1 px-1.5 py-0.5',
    md: 'text-sm gap-1.5 px-2.5 py-1',
    lg: 'text-base gap-2 px-3 py-1.5'
  };

  const details = getHazardTypeDetails();

  return (
    <span 
      className={`inline-flex items-center font-medium rounded-full ${details.bgColor} ${details.textColor} ${sizeClasses[size]}`}
    >
      {details.icon}
      {withLabel && details.label}
    </span>
  );
};

export default HazardTypeBadge;