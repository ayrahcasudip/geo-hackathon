import { 
  HazardType, 
  HazardSeverity, 
  HazardReport, 
  SafeShelter, 
  SafeRoute, 
  User, 
  UserRole 
} from '../types';

// Central coordinates for our mock data (San Francisco area)
const CENTER_LAT = 37.7749;
const CENTER_LNG = -122.4194;

// Generate random latitude and longitude within specified radius from center
const randomLocation = (centerLat: number, centerLng: number, radiusKm: number) => {
  // Convert radius from km to degrees
  const radiusLat = radiusKm / 111;
  const radiusLng = radiusKm / (111 * Math.cos(centerLat * (Math.PI / 180)));
  
  const randomLat = centerLat + (Math.random() * 2 - 1) * radiusLat;
  const randomLng = centerLng + (Math.random() * 2 - 1) * radiusLng;
  
  return { lat: randomLat, lng: randomLng };
};

// Generate random date within last n days
const randomDate = (daysPast: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysPast));
  return date;
};

// Generate mock hazard reports
export const generateMockHazards = (count: number) => {
  const hazards: HazardReport[] = [];
  const hazardTypes = Object.values(HazardType);
  const severityLevels = Object.values(HazardSeverity);
  
  for (let i = 0; i < count; i++) {
    const type = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    
    hazards.push({
      id: `hazard-${i}`,
      type: type,
      severity: severity,
      location: randomLocation(CENTER_LAT, CENTER_LNG, 5),
      description: `${severity} ${type} reported in this area. Please avoid.`,
      reportedBy: `user-${Math.floor(Math.random() * 10)}`,
      reportedAt: randomDate(7),
      verified: Math.random() > 0.3,
      upvotes: Math.floor(Math.random() * 50),
      image: Math.random() > 0.5 ? `https://source.unsplash.com/random/300x200?${type}` : undefined
    });
  }
  
  return hazards;
};

// Generate mock safe shelters
export const generateMockShelters = (count: number) => {
  const shelters: SafeShelter[] = [];
  const facilityTypes = ['School', 'Community Center', 'Hospital', 'Church', 'Government Building'];
  
  for (let i = 0; i < count; i++) {
    shelters.push({
      id: `shelter-${i}`,
      name: `Safe Shelter ${i}`,
      location: randomLocation(CENTER_LAT, CENTER_LNG, 8),
      capacity: Math.floor(Math.random() * 300) + 50,
      facilityType: facilityTypes[Math.floor(Math.random() * facilityTypes.length)],
      contact: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
      currentOccupancy: Math.floor(Math.random() * 100)
    });
  }
  
  return shelters;
};

// Generate mock safe routes
export const generateMockRoutes = (origin: { lat: number, lng: number }, destination: { lat: number, lng: number }) => {
  const routes: SafeRoute[] = [];
  const mockHazards = generateMockHazards(10);
  
  // Generate 3 alternative routes
  for (let i = 0; i < 3; i++) {
    // Create random waypoints between origin and destination
    const waypointCount = Math.floor(Math.random() * 5) + 2;
    const waypoints = [];
    
    for (let j = 0; j < waypointCount; j++) {
      // Interpolate between origin and destination with some random offset
      const ratio = (j + 1) / (waypointCount + 1);
      const lat = origin.lat + (destination.lat - origin.lat) * ratio + (Math.random() * 0.02 - 0.01);
      const lng = origin.lng + (destination.lng - origin.lng) * ratio + (Math.random() * 0.02 - 0.01);
      waypoints.push({ lat, lng });
    }
    
    // Select some random hazards that are being avoided
    const hazardsAvoided = mockHazards
      .slice(0, Math.floor(Math.random() * 5) + 1)
      .map(h => h.id);
    
    routes.push({
      id: `route-${i}`,
      origin,
      destination,
      waypoints,
      hazardsAvoided,
      distance: Math.floor(Math.random() * 10) + 2, // distance in km
      estimatedTime: Math.floor(Math.random() * 30) + 10 // time in minutes
    });
  }
  
  return routes;
};

// Generate mock users
export const generateMockUsers = (count: number) => {
  const users: User[] = [];
  const roles = Object.values(UserRole);
  
  for (let i = 0; i < count; i++) {
    const role = i === 0 
      ? UserRole.ADMIN // First user is always admin
      : roles[Math.floor(Math.random() * roles.length)];
    
    const trustLevel = Math.floor(Math.random() * 100);
    const reportCount = Math.floor(Math.random() * 50);
    const verifiedReportCount = Math.floor(Math.random() * reportCount);
    
    users.push({
      id: `user-${i}`,
      name: `User ${i}`,
      role,
      trustLevel,
      reportCount,
      verifiedReportCount
    });
  }
  
  return users;
};

// Pre-generate some mock data
export const mockHazards = generateMockHazards(20);
export const mockShelters = generateMockShelters(10);
export const mockUsers = generateMockUsers(10);

// Default current user
export const currentUser = mockUsers[0]; // Admin user

// Function to get safe routes between two points
export const getSafeRoutes = (origin: { lat: number, lng: number }, destination: { lat: number, lng: number }) => {
  return generateMockRoutes(origin, destination);
};