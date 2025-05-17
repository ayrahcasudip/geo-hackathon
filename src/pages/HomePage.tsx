import React, { useState, useEffect } from "react";
import SafeRouteMap from "../components/map/SafeRouteMap";
import HazardReportForm from "../components/hazards/HazardReportForm";
import SosButton from "../components/common/SosButton";
import SafetyRouteCard from "../components/common/SafetyRouteCard";
import {
  Location,
  SafeRoute,
  HazardType,
  HazardSeverity,
  HazardReport,
} from "../types";
import sheltersData from "../data/shelters.json";
import { appendHazard, getHazards } from "../utils/fileOperations";
import L from "leaflet";

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

  // Calculate routes when destination changes
  useEffect(() => {
    if (destination && userLocation) {
      // Find hazards that intersect with the direct path
      const directPathHazards = hazards.filter((hazard) => {
        const hazardPoint = L.latLng(hazard.location.lat, hazard.location.lng);
        const originPoint = L.latLng(userLocation.lat, userLocation.lng);
        const destPoint = L.latLng(destination.lat, destination.lng);

        // Calculate distance from hazard to line segment
        const distance = hazardPoint.distanceTo(originPoint);
        const angle = Math.atan2(
          destPoint.lat - originPoint.lat,
          destPoint.lng - originPoint.lng
        );

        // Project hazard point onto the line
        const projectedLat = originPoint.lat + distance * Math.sin(angle);
        const projectedLng = originPoint.lng + distance * Math.cos(angle);
        const projectedPoint = L.latLng(projectedLat, projectedLng);

        // Check if projection is within the line segment
        const isWithinSegment =
          projectedPoint.distanceTo(originPoint) <=
            originPoint.distanceTo(destPoint) &&
          projectedPoint.distanceTo(destPoint) <=
            originPoint.distanceTo(destPoint);

        return isWithinSegment && distance < hazard.impactRadius * 1.2;
      });

      const safeRoute: SafeRoute = {
        id: "route-1",
        origin: userLocation,
        destination: destination,
        waypoints: [],
        hazardsAvoided: directPathHazards.map((h) => h.id),
        distance: 0, // Will be updated by the routing machine
        estimatedTime: 0, // Will be updated by the routing machine
      };

      setSafeRoutes([safeRoute]);
      setSelectedRouteIndex(0);
    }
  }, [destination, userLocation, hazards]);

  const handleMapClick = (location: Location) => {
    setDestination(location);
  };

  const handleReportSubmit = async (reportData: {
    type: HazardType;
    severity: HazardSeverity;
    description: string;
    location: Location;
  }) => {
    try {
      const newHazard: HazardReport = {
        id: `h${hazards.length + 1}`,
        type: reportData.type,
        severity: reportData.severity,
        description: reportData.description,
        location: reportData.location,
        reportedAt: new Date().toISOString(),
        verified: false,
        upvotes: 0,
        impactRadius:
          reportData.severity === "critical"
            ? 500
            : reportData.severity === "high"
            ? 400
            : reportData.severity === "medium"
            ? 300
            : 200,
        reportedBy: "User Report",
      };

      // Update local state immediately
      setHazards((prev) => [...prev, newHazard]);

      // Store in localStorage
      await appendHazard(newHazard);

      alert("Hazard reported successfully!");
    } catch (error) {
      console.error("Error submitting hazard report:", error);
      alert("Failed to submit hazard report. Please try again.");
    }
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
          hazards={hazards}
          shelters={shelters}
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
