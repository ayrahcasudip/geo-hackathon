export interface Location {
  lat: number;
  lng: number;
}

export interface Hazard {
  type: string;
  description: string;
  severity: string;
  impactRadius: number;
  location: Location;
}

export interface Shelter {
  name: string;
  facilityType: string;
  capacity: number;
  currentOccupancy: number;
  contact: string;
  status: "active" | "inactive";
  location: Location;
}

export interface ChatAnalysisResponse {
  message: string;
  userLocation: Location;
  nearbyHazards: Hazard[];
  recommendedShelters: Shelter[];
  response: string;
}

export interface ChatAnalysisRequest {
  userInput: string;
  location: Location;
}

export interface ApiError {
  error: string;
  details?: string;
}
