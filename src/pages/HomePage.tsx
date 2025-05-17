import React, { useState, useEffect } from "react";
import SafeRouteMap from "../components/map/SafeRouteMap";
import HazardReportForm from "../components/hazards/HazardReportForm";
import SosButton from "../components/common/SosButton";
import SafetyRouteCard from "../components/common/SafetyRouteCard";
import { Location, SafeRoute, HazardType, HazardSeverity } from "../types";
import hazardsData from "../data/hazards.json";
import sheltersData from "../data/shelters.json";

// Kathmandu University coordinates as fallback
const KU_COORDINATES: Location = {
  lat: 27.6228,
  lng: 85.5412,
};

const HomePage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [safeRoutes, setSafeRoutes] = useState<SafeRoute[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] =
    useState<PermissionState | null>(null);

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

  // Calculate routes when destination changes
  useEffect(() => {
    if (destination && userLocation) {
      // In a real app, we would call a routing API here
      // For now, we'll create a simple mock route
      const mockRoute: SafeRoute = {
        id: "route-1",
        origin: userLocation,
        destination: destination,
        waypoints: [
          {
            lat: (userLocation.lat + destination.lat) / 2,
            lng: (userLocation.lng + destination.lng) / 2,
          },
        ],
        hazardsAvoided: ["h1", "h2"],
        distance: 2.5,
        estimatedTime: 15,
      };
      setSafeRoutes([mockRoute]);
      setSelectedRouteIndex(0);
    }
  }, [destination, userLocation]);

  const handleMapClick = (location: Location) => {
    setDestination(location);
  };

  const handleReportSubmit = (reportData: {
    type: HazardType;
    severity: HazardSeverity;
    description: string;
    location: Location;
  }) => {
    console.log("Hazard report submitted:", reportData);
    alert("Hazard reported successfully!");
  };

  const handleSosActivate = () => {
    if (userLocation) {
      console.log("SOS activated at location:", userLocation);
      alert("SOS Emergency Alert Sent! Help is on the way.");
    }
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SafeRouteMap
          hazards={hazardsData.hazards}
          shelters={sheltersData.shelters}
          userLocation={userLocation || undefined}
          selectedRoute={selectedRoute}
          onMapClick={handleMapClick}
          height="70vh"
        />
      </div>

      <div className="space-y-6">
        <SosButton onActivate={handleSosActivate} />

        <HazardReportForm
          userLocation={userLocation || undefined}
          onSubmit={handleReportSubmit}
        />

        {safeRoutes.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold mb-3">Safe Routes</h2>
            <div className="space-y-3">
              {safeRoutes.map((route, index) => (
                <SafetyRouteCard
                  key={route.id}
                  route={route}
                  isSelected={index === selectedRouteIndex}
                  onSelect={() => setSelectedRouteIndex(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
