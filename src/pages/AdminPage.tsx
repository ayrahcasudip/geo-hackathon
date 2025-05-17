import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Users, Map, Radio } from 'lucide-react';
import HazardFeed from '../components/hazards/HazardFeed';
import { mockHazards, mockUsers } from '../utils/mockData';
import { HazardReport } from '../types';

const AdminPage: React.FC = () => {
  const [hazards, setHazards] = useState<HazardReport[]>(mockHazards);
  const [activeTab, setActiveTab] = useState<'hazards' | 'users' | 'nodes'>('hazards');
  
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
  
  const getTotalVerifiedHazards = () => {
    return hazards.filter(h => h.verified).length;
  };
  
  const getUnverifiedHazardsCount = () => {
    return hazards.filter(h => !h.verified).length;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage hazard reports, users, and system status.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold">{hazards.length}</p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Verified Reports</p>
              <p className="text-2xl font-bold">{getTotalVerifiedHazards()}</p>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold">{mockUsers.length}</p>
            </div>
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">LoRa Nodes</p>
              <p className="text-2xl font-bold">7</p>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
              <Radio className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button 
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${
                activeTab === 'hazards' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('hazards')}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Hazard Management
                {getUnverifiedHazardsCount() > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {getUnverifiedHazardsCount()}
                  </span>
                )}
              </div>
            </button>
            
            <button 
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${
                activeTab === 'users' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </div>
            </button>
            
            <button 
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${
                activeTab === 'nodes' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('nodes')}
            >
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                LoRa Nodes
              </div>
            </button>
          </nav>
        </div>
        
        <div className="p-4">
          {activeTab === 'hazards' && (
            <HazardFeed 
              hazards={hazards}
              onVerify={handleVerify}
              onUpvote={handleUpvote}
              isAdmin={true}
            />
          )}
          
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trust Level</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockUsers.map(user => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'trusted' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                user.trustLevel > 75 ? 'bg-green-500' : 
                                user.trustLevel > 50 ? 'bg-blue-500' : 
                                user.trustLevel > 25 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${user.trustLevel}%` }}
                            />
                          </div>
                          <span className="ml-2 text-xs">{user.trustLevel}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {user.reportCount} ({user.verifiedReportCount} verified)
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-800">Suspend</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'nodes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">LoRa Network Status</h3>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                  Refresh Status
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(7)].map((_, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Node {index + 1}</h4>
                      <span className={`h-3 w-3 rounded-full ${index < 5 ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={index < 5 ? 'text-green-600' : 'text-red-600'}>
                          {index < 5 ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Battery:</span>
                        <span>{Math.floor(Math.random() * 100)}%</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Signal:</span>
                        <span>{Math.floor(Math.random() * 100)}%</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Message:</span>
                        <span>{Math.floor(Math.random() * 60)} mins ago</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">Network Map</h3>
                <p className="text-sm text-blue-600 mb-3">
                  LoRa mesh network topology and coverage.
                </p>
                <div className="bg-white rounded-lg border p-3 flex items-center justify-center h-48">
                  <Map className="h-12 w-12 text-gray-400" />
                  <p className="ml-3 text-gray-500">LoRa network map visualization would render here</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;