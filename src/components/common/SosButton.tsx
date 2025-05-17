import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface SosButtonProps {
  onActivate: () => void;
}

const SosButton: React.FC<SosButtonProps> = ({ onActivate }) => {
  const [pressed, setPressed] = useState(false);
  const [holdTimeout, setHoldTimeout] = useState<number | null>(null);
  
  const handleMouseDown = () => {
    const timeout = window.setTimeout(() => {
      setPressed(true);
      onActivate();
    }, 1500) as unknown as number; // Cast to number to satisfy TypeScript
    
    setHoldTimeout(timeout);
  };
  
  const handleMouseUp = () => {
    if (holdTimeout) {
      window.clearTimeout(holdTimeout);
      setHoldTimeout(null);
    }
    
    // Reset after animation completes
    if (pressed) {
      setTimeout(() => setPressed(false), 500);
    }
  };

  return (
    <button
      className={`relative w-full h-14 md:h-16 rounded-xl font-bold text-white ${
        pressed ? 'bg-red-800 scale-95' : 'bg-red-600 hover:bg-red-700'
      } transition-all duration-200 flex items-center justify-center gap-2 shadow-lg`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <AlertTriangle className="h-6 w-6" />
      <span className="text-lg">
        {pressed ? 'SOS ACTIVATED!' : 'HOLD FOR SOS'}
      </span>
      
      {/* Progress indicator for press-and-hold */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-800 origin-left scale-x-0 transition-transform">
        <div 
          className={`h-full bg-white ${holdTimeout ? 'animate-grow-x' : ''}`}
          style={{ animationDuration: '1.5s' }}
        />
      </div>
    </button>
  );
};

export default SosButton;