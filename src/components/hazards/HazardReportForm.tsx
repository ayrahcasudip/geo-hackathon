import React, { useState } from 'react';
import { AlertTriangle, Mic, MapPin, Camera, Send } from 'lucide-react';
import { HazardType, HazardSeverity, Location } from '../../types';

interface HazardReportFormProps {
  userLocation?: Location;
  onSubmit: (reportData: {
    type: HazardType;
    severity: HazardSeverity;
    description: string;
    location: Location;
  }) => void;
}

const HazardReportForm: React.FC<HazardReportFormProps> = ({
  userLocation,
  onSubmit
}) => {
  const [type, setType] = useState<HazardType>(HazardType.OTHER);
  const [severity, setSeverity] = useState<HazardSeverity>(HazardSeverity.MEDIUM);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<Location | undefined>(userLocation);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  
  const handleVoiceRecord = () => {
    setIsRecordingVoice(!isRecordingVoice);
    
    // Simulate voice recording and processing
    if (!isRecordingVoice) {
      setTimeout(() => {
        // Simulate voice recognition result
        setDescription('Fire spotted near the main road with large smoke clouds visible');
        setType(HazardType.FIRE);
        setIsRecordingVoice(false);
      }, 2000);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      alert('Location is required');
      return;
    }
    
    onSubmit({
      type,
      severity,
      description,
      location
    });
    
    // Reset form
    setType(HazardType.OTHER);
    setSeverity(HazardSeverity.MEDIUM);
    setDescription('');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        Report Hazard
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hazard Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as HazardType)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(HazardType).map(hazardType => (
                <option key={hazardType} value={hazardType}>
                  {hazardType.charAt(0).toUpperCase() + hazardType.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(HazardSeverity).map(severityLevel => (
                <button
                  key={severityLevel}
                  type="button"
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    severity === severityLevel
                      ? severityLevel === HazardSeverity.LOW ? 'bg-blue-100 text-blue-700' :
                        severityLevel === HazardSeverity.MEDIUM ? 'bg-yellow-100 text-yellow-700' :
                        severityLevel === HazardSeverity.HIGH ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSeverity(severityLevel)}
                >
                  {severityLevel.charAt(0).toUpperCase() + severityLevel.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe the hazard..."
              />
              
              <div className="absolute right-2 bottom-2 flex gap-2">
                <button
                  type="button"
                  className={`p-2 rounded-full ${
                    isRecordingVoice 
                      ? 'bg-red-100 text-red-600 animate-pulse' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={handleVoiceRecord}
                >
                  <Mic className="h-5 w-5" />
                </button>
                
                <button
                  type="button"
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {isRecordingVoice && (
              <div className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                <span className="h-2 w-2 bg-red-600 rounded-full animate-ping" />
                Recording voice... Speak clearly
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                {location 
                  ? `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}` 
                  : 'Location not available'}
              </span>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
          >
            <Send className="h-5 w-5" />
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
};

export default HazardReportForm;