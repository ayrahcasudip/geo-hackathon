import React, { useState } from 'react';
import HazardFeed from '../components/hazards/HazardFeed';
import { mockHazards } from '../utils/mockData';
import { HazardReport } from '../types';

const HazardsPage: React.FC = () => {
  const [hazards, setHazards] = useState<HazardReport[]>(mockHazards);
  
  const handleVerify = (id: string, verified: boolean) => {
    setHazards(prev => 
      prev.map(hazard => 
        hazard.id === id ? { ...hazard, verified } : hazard
      )
    );
  };
  
  const handleUpvote = (id: string) => {
    setHazards(prev => 
      prev.map(hazard => 
        hazard.id === id ? { ...hazard, upvotes: hazard.upvotes + 1 } : hazard
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Hazard Reports</h1>
        <p className="text-gray-600">
          View all reported hazards in your area. Upvote to confirm reports, helping others stay safe.
        </p>
      </div>
      
      <HazardFeed 
        hazards={hazards}
        onVerify={handleVerify}
        onUpvote={handleUpvote}
        isAdmin={true}
      />
    </div>
  );
};

export default HazardsPage;