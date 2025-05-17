import React, { useState } from 'react';
import { Filter, ArrowUp, ArrowDown, CheckCircle, XCircle } from 'lucide-react';
import { HazardReport, HazardType, HazardSeverity } from '../../types';
import HazardTypeBadge from '../common/HazardTypeBadge';
import HazardSeverityBadge from '../common/HazardSeverityBadge';

interface HazardFeedProps {
  hazards: HazardReport[];
  isAdmin?: boolean;
  onVerify?: (id: string, verified: boolean) => void;
  onUpvote?: (id: string) => void;
}

const HazardFeed: React.FC<HazardFeedProps> = ({
  hazards,
  isAdmin = false,
  onVerify,
  onUpvote
}) => {
  const [sortBy, setSortBy] = useState<'recent' | 'severity'>('recent');
  const [filterType, setFilterType] = useState<HazardType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<HazardSeverity | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sort and filter hazards
  const filteredHazards = hazards
    .filter(hazard => filterType === 'all' || hazard.type === filterType)
    .filter(hazard => filterSeverity === 'all' || hazard.severity === filterSeverity)
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return b.reportedAt.getTime() - a.reportedAt.getTime();
      } else {
        const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
    });
  
  const handleUpvote = (id: string) => {
    if (onUpvote) {
      onUpvote(id);
    }
  };
  
  const handleVerify = (id: string, verified: boolean) => {
    if (onVerify) {
      onVerify(id, verified);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hazard Feed</h2>
          
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                sortBy === 'recent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setSortBy('recent')}
            >
              Recent
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                sortBy === 'severity' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setSortBy('severity')}
            >
              Severity
            </button>
            <button
              className={`p-1.5 rounded-full ${showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Filter options */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Hazard Type</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    className={`px-2 py-1 rounded text-xs ${
                      filterType === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilterType('all')}
                  >
                    All
                  </button>
                  {Object.values(HazardType).map(type => (
                    <button
                      key={type}
                      className={`px-2 py-1 rounded text-xs ${
                        filterType === type ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => setFilterType(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Severity</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    className={`px-2 py-1 rounded text-xs ${
                      filterSeverity === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => setFilterSeverity('all')}
                  >
                    All
                  </button>
                  {Object.values(HazardSeverity).map(severity => (
                    <button
                      key={severity}
                      className={`px-2 py-1 rounded text-xs ${
                        filterSeverity === severity ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => setFilterSeverity(severity)}
                    >
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {filteredHazards.length > 0 ? (
          filteredHazards.map(hazard => (
            <div key={hazard.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex gap-2">
                  <HazardTypeBadge type={hazard.type} />
                  <HazardSeverityBadge severity={hazard.severity} />
                </div>
                
                {hazard.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              
              <p className="text-sm mb-2">{hazard.description}</p>
              
              {hazard.image && (
                <div className="mb-2 rounded-lg overflow-hidden h-24">
                  <img 
                    src={hazard.image} 
                    alt={hazard.type} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div>
                  <span>Reported {hazard.reportedAt.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    className="flex items-center gap-1 hover:text-blue-600"
                    onClick={() => handleUpvote(hazard.id)}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                    <span>{hazard.upvotes}</span>
                  </button>
                  
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button 
                        className="p-1 rounded-full hover:bg-green-100 hover:text-green-600"
                        onClick={() => handleVerify(hazard.id, true)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 rounded-full hover:bg-red-100 hover:text-red-600"
                        onClick={() => handleVerify(hazard.id, false)}
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No hazards match the current filters
          </div>
        )}
      </div>
    </div>
  );
};

export default HazardFeed;