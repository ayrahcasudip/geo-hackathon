import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { ConnectionStatus } from '../../types';

const Layout: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.ONLINE);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
  // Simulate connection status change
  const simulateConnectionChange = () => {
    const statusOptions = Object.values(ConnectionStatus);
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    setConnectionStatus(randomStatus);
  };
  
  // For demonstration purposes, change connection status every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(simulateConnectionChange, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        connectionStatus={connectionStatus}
        notifications={3}
        onLanguageChange={setCurrentLanguage}
        currentLanguage={currentLanguage}
      />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;