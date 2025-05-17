import React, { useState, useEffect } from "react";
import { AlertTriangle, MapPin, Clock, ThumbsUp, User } from "lucide-react";
import SafeRouteMap from "../components/map/SafeRouteMap";
import { Location, HazardReport } from "../types";
import { getHazards } from "../utils/fileOperations";

// Kathmandu University coordinates as fallback
const KU_COORDINATES: Location = {
  lat: 27.6228,
  lng: 85.5412,
};

const HazardsPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] =
    useState<PermissionState | null>(null);
  const [hazards, setHazards] = useState<HazardReport[]>([]);

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

  const handleRetryLocation = () => {
    setLoading(true);
    setError(null);
    getUserLocation();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

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
        <h1 className="text-2xl font-bold mb-2">Active Hazards</h1>
        <p className="text-gray-600">
          View and monitor all reported hazards in your area.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SafeRouteMap
            hazards={hazards}
            shelters={[]}
            userLocation={userLocation || undefined}
            height="60vh"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Reported Hazards</h2>

            <div className="space-y-4">
              {hazards.map((hazard) => (
                <div
                  key={hazard.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-red-600">{hazard.type}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getSeverityColor(
                        hazard.severity
                      )}`}
                    >
                      {hazard.severity}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {hazard.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Impact Radius: {hazard.impactRadius}m</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        Reported: {new Date(hazard.reportedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-gray-500" />
                      <span>{hazard.upvotes} upvotes</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Reported by: {hazard.reportedBy}</span>
                    </div>

                    {hazard.verified && (
                      <div className="flex items-center gap-2 text-green-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Verified by authorities</span>
                      </div>
                    )}
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

export default HazardsPage;
