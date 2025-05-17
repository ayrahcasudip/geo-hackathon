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
const RoutingMachine = ({
  route,
  hazards,
}: {
  route: SafeRoute;
  hazards: HazardReport[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (!route) return;

    // Create hazard avoidance areas with buffer zones
    const hazardAreas = hazards
      .filter((hazard) => route.hazardsAvoided.includes(hazard.id))
      .map((hazard) => ({
        latlng: L.latLng(hazard.location.lat, hazard.location.lng),
        radius: hazard.impactRadius,
        // Add a safety buffer to the impact radius
        bufferRadius: hazard.impactRadius * 1.2,
      }));

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(route.origin.lat, route.origin.lng),
        L.latLng(route.destination.lat, route.destination.lng),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: "#3B82F6", weight: 4, opacity: 0.7 }],
      },
      createMarker: () => null,
      route: (waypoints, callback) => {
        const router = L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        });

        router.route(waypoints, (err, routes) => {
          if (err) {
            callback(err);
            return;
          }

          // Check if route intersects with any hazard area
          const routeIntersectsHazard = routes.some((route) => {
            const routePoints = route.coordinates.map((coord) =>
              L.latLng(coord.lat, coord.lng)
            );

            return hazardAreas.some((hazard) => {
              return routePoints.some((point) => {
                const distance = point.distanceTo(hazard.latlng);
                return distance < hazard.bufferRadius;
              });
            });
          });

          if (routeIntersectsHazard) {
            // If route intersects hazards, find alternative route
            const alternativeWaypoints = [...waypoints];
            const addedWaypoints = new Set<string>();

            hazardAreas.forEach((hazard) => {
              // Calculate multiple waypoints around the hazard
              const angles = [Math.PI / 2, -Math.PI / 2]; // Try both sides
              const baseAngle = Math.atan2(
                route.destination.lat - route.origin.lat,
                route.destination.lng - route.origin.lng
              );

              angles.forEach((angle) => {
                const waypointAngle = baseAngle + angle;
                const waypointLat =
                  hazard.latlng.lat +
                  Math.sin(waypointAngle) * (hazard.bufferRadius + 50);
                const waypointLng =
                  hazard.latlng.lng +
                  Math.cos(waypointAngle) * (hazard.bufferRadius + 50);

                const waypointKey = `${waypointLat},${waypointLng}`;
                if (!addedWaypoints.has(waypointKey)) {
                  alternativeWaypoints.splice(
                    1,
                    0,
                    L.latLng(waypointLat, waypointLng)
                  );
                  addedWaypoints.add(waypointKey);
                }
              });
            });

            // Try routing with alternative waypoints
            router.route(alternativeWaypoints, (err, altRoutes) => {
              if (err || !altRoutes || altRoutes.length === 0) {
                // If alternative routing fails, fall back to original route
                callback(null, routes);
              } else {
                // Check if alternative route is better
                const originalDistance = routes[0].summary.totalDistance;
                const altDistance = altRoutes[0].summary.totalDistance;

                if (altDistance < originalDistance * 1.5) {
                  // Use alternative route if it's not too much longer
                  callback(null, altRoutes);
                } else {
                  // Fall back to original route
                  callback(null, routes);
                }
              }
            });
          } else {
            callback(null, routes);
          }
        });
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

        // Draw hazard avoidance zones
        hazardAreas.forEach((hazard) => {
          L.circle(hazard.latlng, {
            radius: hazard.bufferRadius,
            color: "red",
            fillColor: "red",
            fillOpacity: 0.1,
            weight: 1,
            dashArray: "5, 5",
          }).addTo(map);
        });
      }
    });

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, route, hazards]);

  return null;
};

interface SafeRouteMapProps {
  hazards: HazardReport[];
  shelters: SafeShelter[];
  selectedRoute?: SafeRoute;
  userLocation?: Location;
  onMapClick?: (location: Location) => void;
  onShelterSelect?: (shelter: SafeShelter) => void;
  height?: string;
}

const SafeRouteMap: React.FC<SafeRouteMapProps> = ({
  hazards,
  shelters,
  selectedRoute,
  userLocation,
  onMapClick,
  onShelterSelect,
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
                {onShelterSelect && (
                  <button
                    onClick={() => onShelterSelect(shelter)}
                    className="mt-3 w-full bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Navigate Here
                  </button>
                )}
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
        {selectedRoute && (
          <RoutingMachine route={selectedRoute} hazards={hazards} />
        )}
      </MapContainer>
    </div>
  );
};

export default SafeRouteMap;
