import React, { useState, useEffect } from "react";
import { Phone, Users, Building, MapPin, Navigation } from "lucide-react";
import SafeRouteMap from "../components/map/SafeRouteMap";
import { Location, SafeRoute, HazardReport, SafeShelter } from "../types";
import sheltersData from "../data/shelters.json";
import { getHazards } from "../utils/fileOperations";

// Kathmandu University coordinates as fallback
const KU_COORDINATES: Location = {
  lat: 27.6228,
  lng: 85.5412,
};

const SheltersPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<SafeShelter | null>(
    null
  );
  const [safeRoutes, setSafeRoutes] = useState<SafeRoute[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] =
    useState<PermissionState | null>(null);
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [shelters, setShelters] = useState(sheltersData.shelters);

  // Load hazards from localStorage or JSON file
  useEffect(() => {
    const loadHazards = async () => {
      try {
        const loadedHazards = await getHazards();
        setHazards(loadedHazards);
      } catch (error) {
        console.error("Error loading hazards:", error);
      }
    };
    loadHazards();
  }, []);

  // Check location permission status
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({
          name: "geolocation",
        });
        setLocationPermission(result.state);

        result.addEventListener("change", () => {
          setLocationPermission(result.state);
        });
      } catch (error) {
        console.warn("Permission API not supported:", error);
      }
    };

    checkPermission();
  }, []);

  // Get user's location with retry mechanism
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setUserLocation(KU_COORDINATES);
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const successCallback = (position: GeolocationPosition) => {
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setUserLocation(newLocation);
      setError(null);
      setLoading(false);
    };

    const errorCallback = (error: GeolocationPositionError) => {
      console.error("Error getting location:", error);

      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError("Location access denied. Using default location.");
          break;
        case error.POSITION_UNAVAILABLE:
          setError(
            "Location information is unavailable. Using default location."
          );
          break;
        case error.TIMEOUT:
          setError("Location request timed out. Using default location.");
          break;
        default:
          setError("An unknown error occurred. Using default location.");
      }

      setUserLocation(KU_COORDINATES);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      options
    );
  };

  // Initial location fetch
  useEffect(() => {
    getUserLocation();
  }, []);

  // Retry location fetch when permission changes
  useEffect(() => {
    if (locationPermission === "granted") {
      getUserLocation();
    }
  }, [locationPermission]);

  // Calculate routes when shelter is selected
  useEffect(() => {
    if (selectedShelter && userLocation) {
      const route: SafeRoute = {
        id: `route-${selectedShelter.id}`,
        origin: userLocation,
        destination: selectedShelter.location,
        waypoints: [],
        hazardsAvoided: hazards
          .filter((hazard) => {
            // Check if hazard is between user and shelter
            const hazardLat = hazard.location.lat;
            const hazardLng = hazard.location.lng;
            const userLat = userLocation.lat;
            const userLng = userLocation.lng;
            const shelterLat = selectedShelter.location.lat;
            const shelterLng = selectedShelter.location.lng;

            // Simple check if hazard is within the bounding box of the route
            const minLat = Math.min(userLat, shelterLat);
            const maxLat = Math.max(userLat, shelterLat);
            const minLng = Math.min(userLng, shelterLng);
            const maxLng = Math.max(userLng, shelterLng);

            return (
              hazardLat >= minLat &&
              hazardLat <= maxLat &&
              hazardLng >= minLng &&
              hazardLng <= maxLng
            );
          })
          .map((hazard) => hazard.id),
        distance: 0, // Will be calculated by the routing machine
        estimatedTime: 0, // Will be calculated by the routing machine
      };
      setSafeRoutes([route]);
      setSelectedRouteIndex(0);
    }
  }, [selectedShelter, userLocation, hazards]);

  const handleShelterSelect = (shelter: SafeShelter) => {
    setSelectedShelter(shelter);
  };

  const handleRetryLocation = () => {
    setLoading(true);
    setError(null);
    getUserLocation();
  };

  const selectedRoute =
    selectedRouteIndex !== null ? safeRoutes[selectedRouteIndex] : undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="bg-red-50 p-6 rounded-lg max-w-md">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRetryLocation}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Retry Location
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Safe Shelters</h1>
        <p className="text-gray-600">
          Find and navigate to the nearest safe shelters in your area during
          emergencies.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SafeRouteMap 
            hazards={hazards}
            shelters={shelters}
            userLocation={userLocation || undefined}
            selectedRoute={selectedRoute}
            onShelterSelect={handleShelterSelect}
            height="60vh"
          />
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Nearest Shelters</h2>
            
            <div className="space-y-4">
              {shelters.map((shelter) => (
                <div
                  key={shelter.id}
                  className={`border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer ${
                    selectedShelter?.id === shelter.id
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                  onClick={() => handleShelterSelect(shelter)}
                >
                  <h3 className="font-medium text-blue-600 mb-2">
                    {shelter.name}
                  </h3>
                  
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
                        {(Math.random() * 5 + 0.5).toFixed(1)} km away
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a
                        href={`tel:${shelter.contact}`}
                        className="text-blue-600 hover:underline"
                      >
                        {shelter.contact}
                      </a>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {shelter.facilities.map((facility, index) => (
                        <span
                          key={index}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                        >
                          {facility}
                        </span>
                      ))}
                  </div>
                  
                    <button
                      onClick={() => handleShelterSelect(shelter)}
                      className="mt-3 w-full bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Navigate Here
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
