import React from 'react';
import { Phone, Users, Building, MapPin } from 'lucide-react';
import SafeRouteMap from '../components/map/SafeRouteMap';
import { mockHazards, mockShelters } from '../utils/mockData';
import { Location } from '../types';

const SheltersPage: React.FC = () => {
  const [userLocation, setUserLocation] = React.useState<Location>({ lat: 37.7749, lng: -122.4194 });
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Safe Shelters</h1>
        <p className="text-gray-600">
          Find and navigate to the nearest safe shelters in your area during emergencies.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SafeRouteMap 
            hazards={mockHazards}
            shelters={mockShelters}
            userLocation={userLocation}
            height="60vh"
          />
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Nearest Shelters</h2>
            
            <div className="space-y-4">
              {mockShelters.slice(0, 5).map(shelter => (
                <div key={shelter.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <h3 className="font-medium text-blue-600 mb-2">{shelter.name}</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span>{shelter.facilityType}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>
                        Capacity: {shelter.capacity} 
                        {shelter.currentOccupancy !== undefined && (
                          <span className="text-green-600 ml-1">
                            ({shelter.currentOccupancy} available)
                          </span>
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>
                        {((Math.random() * 5) + 0.5).toFixed(1)} miles away
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${shelter.contact}`} className="text-blue-600 hover:underline">
                        {shelter.contact}
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-1.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors">
                      Navigate
                    </button>
                    <button className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded font-medium text-sm hover:bg-gray-200 transition-colors">
                      Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SheltersPage;