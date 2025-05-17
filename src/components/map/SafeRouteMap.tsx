import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import { HazardReport, SafeShelter, SafeRoute, Location } from "../../types";
import L from "leaflet";
import "leaflet-routing-machine";

// Custom hook to update map bounds
const MapBounds = ({ bounds }: { bounds: LatLngBounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);
  return null;
};

// Custom hook to center map
const MapCenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Custom hook for routing
const RoutingMachine = ({ route }: { route: SafeRoute }) => {
  const map = useMap();

  useEffect(() => {
    if (!route) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(route.origin.lat, route.origin.lng),
        L.latLng(route.destination.lat, route.destination.lng),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      routeWhileDragging: true,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: "#3B82F6", weight: 4, opacity: 0.7 }],
      },
    }).addTo(map);

    // Add route calculation event listener
    routingControl.on("routesfound", (e) => {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        console.log("Route found:", {
          distance: route.summary.totalDistance,
          duration: route.summary.totalTime,
        });
      }
    });

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, route]);

  return null;
};

interface SafeRouteMapProps {
  hazards: HazardReport[];
  shelters: SafeShelter[];
  selectedRoute?: SafeRoute;
  userLocation?: Location;
  onMapClick?: (location: Location) => void;
  height?: string;
}

const SafeRouteMap: React.FC<SafeRouteMapProps> = ({
  hazards,
  shelters,
  selectedRoute,
  userLocation,
  onMapClick,
  height = "100%",
}) => {
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);

  // Default center (Kathmandu University)
  const defaultCenter: [number, number] = [27.6228, 85.5412];

  const [center, setCenter] = useState<[number, number]>(
    userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter
  );

  // Create custom icons
  const hazardIcon = new Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const shelterIcon = new Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const userIcon = new Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Update center when userLocation changes
  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  // Handle map click
  const handleMapClick = (e: { latlng: { lat: number; lng: number } }) => {
    if (onMapClick) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  };

  return (
    <div
      style={{ height, width: "100%" }}
      className="rounded-xl overflow-hidden border border-gray-300 shadow-md"
    >
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        onClick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Center map if needed */}
        <MapCenter center={center} />

        {/* Fit bounds if available */}
        {bounds && <MapBounds bounds={bounds} />}

        {/* Render hazards */}
        {hazards.map((hazard) => (
          <React.Fragment key={hazard.id}>
            <Marker
              position={[hazard.location.lat, hazard.location.lng]}
              icon={hazardIcon}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-bold text-red-600">
                    {hazard.type.toUpperCase()}
                  </h3>
                  <p className="text-sm">{hazard.description}</p>
                  <p className="text-xs text-gray-500">
                    Reported: {new Date(hazard.reportedAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-red-500">
                    Impact Radius: {hazard.impactRadius}m
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Hazard impact radius */}
            <Circle
              center={[hazard.location.lat, hazard.location.lng]}
              radius={hazard.impactRadius}
              pathOptions={{
                fillColor: "red",
                fillOpacity: 0.2,
                color: "red",
                weight: 1,
              }}
            />
          </React.Fragment>
        ))}

        {/* Render shelters */}
        {shelters.map((shelter) => (
          <Marker
            key={shelter.id}
            position={[shelter.location.lat, shelter.location.lng]}
            icon={shelterIcon}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-green-600">{shelter.name}</h3>
                <p className="text-sm">{shelter.facilityType}</p>
                <p className="text-sm">Capacity: {shelter.capacity}</p>
                <p className="text-sm">Contact: {shelter.contact}</p>
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-600">
                    Facilities:
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {shelter.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render user location */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="p-1">
                <p className="font-medium">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render selected route with routing machine */}
        {selectedRoute && <RoutingMachine route={selectedRoute} />}
      </MapContainer>
    </div>
  );
};

export default SafeRouteMap;
