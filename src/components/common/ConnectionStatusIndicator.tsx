import React from 'react';
import { Wifi, WifiOff, Radio } from 'lucide-react';
import { ConnectionStatus } from '../../types';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({ status }) => {
  const getStatusDetails = () => {
    switch (status) {
      case ConnectionStatus.ONLINE:
        return {
          icon: <Wifi className="h-5 w-5" />,
          label: 'Online',
          color: 'text-green-500',
          bgColor: 'bg-green-100'
        };
      case ConnectionStatus.OFFLINE:
        return {
          icon: <WifiOff className="h-5 w-5" />,
          label: 'Offline',
          color: 'text-orange-500',
          bgColor: 'bg-orange-100'
        };
      case ConnectionStatus.LORA:
        return {
          icon: <Radio className="h-5 w-5" />,
          label: 'LoRa',
          color: 'text-blue-500',
          bgColor: 'bg-blue-100'
        };
      default:
        return {
          icon: <WifiOff className="h-5 w-5" />,
          label: 'Unknown',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const details = getStatusDetails();

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${details.bgColor} ${details.color}`}>
      {details.icon}
      <span className="text-sm font-medium">{details.label}</span>
    </div>
  );
};

export default ConnectionStatusIndicator;