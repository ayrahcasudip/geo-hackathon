import React from 'react';
import { MapPin, Clock, Navigation, AlertTriangle } from 'lucide-react';
import { SafeRoute } from '../../types';

interface SafetyRouteCardProps {
  route: SafeRoute;
  isSelected?: boolean;
  onSelect: () => void;
}

const SafetyRouteCard: React.FC<SafetyRouteCardProps> = ({
  route,
  isSelected = false,
  onSelect,
}) => {
  return (
    <div 
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-blue-50 border-2 border-blue-500' 
          : 'bg-white border border-gray-200 hover:border-blue-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-blue-700">Route {route.id.split('-')[1]}</h3>
        {isSelected && (
          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
            Selected
          </span>
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{route.distance} km</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>{route.estimatedTime} mins</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-gray-500" />
          <span>{route.waypoints.length} waypoints</span>
        </div>
        
        {route.hazardsAvoided.length > 0 && (
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Avoids {route.hazardsAvoided.length} hazards</span>
          </div>
        )}
      </div>
      
      <button 
        className={`mt-3 w-full py-1.5 px-3 rounded text-sm font-medium ${
          isSelected 
            ? 'bg-blue-600 text-white' 
            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
        }`}
      >
        {isSelected ? 'Navigate Now' : 'Select Route'}
      </button>
    </div>
  );
};

export default SafetyRouteCard;