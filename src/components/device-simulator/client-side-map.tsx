'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import axios from 'axios'

// Custom CSS for dark theme popups
const darkPopupStyle = `
  .dark-theme-popup .leaflet-popup-content-wrapper {
    background-color: #1f2937;
    color: #e5e7eb;
    border: 1px solid #374151;
  }
  .dark-theme-popup .leaflet-popup-tip {
    background-color: #1f2937;
    border-left: 1px solid #374151;
    border-top: 1px solid #374151;
  }
  .dark-theme-popup input {
    background-color: #111827;
    border: 1px solid #374151;
    color: #e5e7eb;
  }
  .dark-theme-popup button {
    background-color: #1d4ed8;
  }
  .dark-theme-popup button:hover {
    background-color: #1e40af;
  }
  /* Fix for polyline mouse events */
  .leaflet-interactive {
    cursor: inherit !important;
  }
`;

// Fix the marker icons - create actual different colored icons
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const midIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const routeStartIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const routeEndIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Position {
  lat: number;
  lng: number;
  timestamp?: string; 
}

interface RouteGeometry {
  coordinates: number[][];
  type: string;
}

interface Route {
  route_id: string;
  route_name: string;
  center_latitude: string;
  center_longitude: string;
}

interface RouteCoordinate {
  route_coordinates_id: string;
  latitude: string;
  longitude: string;
  sequence: number;
  route: {
    route_id: string;
    route_name: string;
    center_latitude: string;
    center_longitude: string;
  }
}

interface MapProps {
  sessionActive: boolean;
  markers?: Position[];
  onAddMarker?: (position: Position) => void;
  onRemoveMarker?: (index: number) => void;
  onClearMarkers?: () => void;
  onUpdateMarkerTimestamp?: (index: number, newTimestamp: string) => void;
  routeCoordinates?: RouteCoordinate[];
  selectedRoute?: Route | null;
}

// Component to update map center when selected route changes
const MapCenterUpdater = ({ selectedRoute }: { selectedRoute?: Route | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedRoute && selectedRoute.center_latitude && selectedRoute.center_longitude) {
      const lat = parseFloat(selectedRoute.center_latitude);
      const lng = parseFloat(selectedRoute.center_longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], 13);
      }
    }
  }, [selectedRoute, map]);
  
  return null;
};

const MarkerManager = ({ sessionActive, onAddMarker, routeLoading, loading }: MapProps & { 
  routeLoading: boolean,
  loading: boolean 
}) => {
  const [ignoreClicks, setIgnoreClicks] = useState(false);
  
  // Update cursor based on both sessionActive, routeLoading and loading
  useEffect(() => {
    const mapContainer = document.querySelector('.leaflet-container') as HTMLElement;
    if (mapContainer) {
      if (routeLoading || loading) {
        mapContainer.style.cursor = 'wait'; // Show loading cursor during route calculation
      } else {
        mapContainer.style.cursor = sessionActive ? 'crosshair' : 'grab';
      }
      
      // Add CSS to ensure markers have the pointer cursor
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .leaflet-marker-icon {
          cursor: pointer !important;
        }
      `;
      document.head.appendChild(styleElement);
      
      return () => {
        if (mapContainer) {
          mapContainer.style.cursor = 'grab';
        }
        document.head.removeChild(styleElement);
      };
    }
  }, [sessionActive, routeLoading, loading]);
  
  // Function to temporarily disable clicking
  const disableClicks = useCallback((duration: number) => {
    setIgnoreClicks(true);
    // Change cursor to indicate clicks are disabled
    const mapContainer = document.querySelector('.leaflet-container') as HTMLElement;
    if (mapContainer) {
      mapContainer.style.cursor = 'not-allowed';
    }
    
    setTimeout(() => {
      setIgnoreClicks(false);
      // Restore cursor based on current states
      if (mapContainer) {
        if (routeLoading || loading) {
          mapContainer.style.cursor = 'wait';
        } else {
          mapContainer.style.cursor = sessionActive ? 'crosshair' : 'grab';
        }
      }
      console.log("Clicks re-enabled, sessionActive:", sessionActive);
    }, duration);
  }, [sessionActive, routeLoading, loading]);
  
  const map = useMapEvents({
    click: (e) => {
      if (sessionActive && !ignoreClicks && !routeLoading && !loading) {
        const newPosition = {
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };
        if (onAddMarker) {
          onAddMarker(newPosition);
        }
      }
    }
  });

  // Add style to head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = darkPopupStyle;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Expose the disableClicks function to parent component
  useEffect(() => {
    (window as any).disableMapClicks = disableClicks;
  }, [disableClicks]);
  
  return null;
};

const ClientSideMap = ({ 
  sessionActive = false, 
  markers = [],
  onAddMarker, 
  onRemoveMarker,
  onClearMarkers,
  onUpdateMarkerTimestamp,
  routeCoordinates = [],
  selectedRoute = null
}: MapProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [center, setCenter] = useState<[number, number]>([35.6895, 139.6917]); // Tokyo as default
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [presetRoutePath, setPresetRoutePath] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editableTimestamps, setEditableTimestamps] = useState<{ [index: number]: string }>({});
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const [markerRemovalInProgress, setMarkerRemovalInProgress] = useState<boolean>(false);

  // Update center when selectedRoute changes
  useEffect(() => {
    if (selectedRoute && selectedRoute.center_latitude && selectedRoute.center_longitude) {
      const lat = parseFloat(selectedRoute.center_latitude);
      const lng = parseFloat(selectedRoute.center_longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setCenter([lat, lng]);
      }
    }
  }, [selectedRoute]);

  // Process route coordinates
  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      // Sort by sequence
      const sortedCoordinates = [...routeCoordinates].sort((a, b) => a.sequence - b.sequence);
      
      // Convert to [lat, lng] format for Leaflet
      const path = sortedCoordinates.map(coord => [
        parseFloat(coord.latitude), 
        parseFloat(coord.longitude)
      ] as [number, number]);
      
      setPresetRoutePath(path);
    } else {
      setPresetRoutePath([]);
    }
  }, [routeCoordinates]);

  // Keep editableTimestamps in sync with markers
  useEffect(() => {
    const updatedTimestamps: { [index: number]: string } = {};
    markers.forEach((marker, index) => {
      if (marker.timestamp) {
        const dateObj = new Date(marker.timestamp);
        updatedTimestamps[index] = formatDateTimeForInput(dateObj);
      } else {
        updatedTimestamps[index] = formatDateTimeForInput(new Date());
      }
    });
    setEditableTimestamps(updatedTimestamps);
  }, [markers]);
  
  // Initialize editable timestamps from markers
  useEffect(() => {
    const initialTimestamps: { [index: number]: string } = {};
    markers.forEach((marker, index) => {
      if (marker.timestamp) {
        const dateObj = new Date(marker.timestamp);
        initialTimestamps[index] = formatDateTimeForInput(dateObj);
      } else {
        initialTimestamps[index] = formatDateTimeForInput(new Date());
      }
    });
    setEditableTimestamps(initialTimestamps);
  }, [markers.length]);
  
  // Format date for datetime-local input
  const formatDateTimeForInput = (date: Date) => {
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
  };
  
  // Handle timestamp change
  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value;
    setEditableTimestamps(prev => ({
      ...prev,
      [index]: newValue
    }));
  };
  
  // Save timestamp changes
  const saveTimestampChanges = (index: number) => {
    // Get the input value
    const inputValue = editableTimestamps[index];
    
    // Create a timestamp that preserves the exact time the user entered
    // by adding the timezone offset to the ISO string
    const date = new Date(inputValue);
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString();
    
    if (onUpdateMarkerTimestamp) {
      onUpdateMarkerTimestamp(index, localISOTime);
      // Close the popup after saving
      const popupCloseButton = document.querySelector('.leaflet-popup-close-button') as HTMLElement;
      if (popupCloseButton) {
        popupCloseButton.click();
      }
    }
  };
  
  // Handle marker additions
  const handleAddMarker = useCallback((position: Position) => {
    setPositions(prev => [...prev, position]);
    if (onAddMarker) {
      onAddMarker(position);
    }
  }, [onAddMarker]);
  
  // Handle marker removals
  const handleRemoveMarkerClick = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set all loading states to true
    setRouteLoading(true);
    setLoading(true);
    setMarkerRemovalInProgress(true);
    
    // Close the popup before removing the marker
    const popupCloseButton = document.querySelector('.leaflet-popup-close-button') as HTMLElement;
    if (popupCloseButton) {
      popupCloseButton.click();
    }
    
    // Disable map clicks for 300ms and change cursor
    if ((window as any).disableMapClicks) {
      (window as any).disableMapClicks(300);
    }
    
    // Remove the marker with a small delay to ensure cursor gets updated first
    setTimeout(() => {
      if (onRemoveMarker) {
        onRemoveMarker(index);
      }
    }, 50);
  }, [onRemoveMarker]);
  
  // Fetch route when we have at least 2 markers
  useEffect(() => {
    const fetchRoute = async () => {
      // Check if we have at least 2 markers to calculate a route
      if (markers.length >= 2) {
        try {
          // Make sure we keep loading states true if we were already loading
          // (this ensures consistency if a marker was just removed)
          setLoading(true);
          setRouteLoading(true);
          
          // Clear previous route path
          setRoutePath([]);
          
          // Fetch routes between consecutive waypoints
          const routeSegments = [];
          
          for (let i = 0; i < markers.length - 1; i++) {
            const startPoint = markers[i];
            const endPoint = markers[i + 1];
            
            // Build the URL with query parameters
            const routeUrl = `${process.env.NEXT_PUBLIC_API_URL}/osrm/route?start=${startPoint.lat},${startPoint.lng}&end=${endPoint.lat},${endPoint.lng}`;
            
            const response = await axios.get(routeUrl);
            
            if (response.data && response.data.routes && response.data.routes.length > 0) {
              // OSRM returns coordinates as [lng, lat], but Leaflet expects [lat, lng]
              const routeCoordinates = response.data.routes[0].geometry.coordinates.map(
                (coord: number[]) => [coord[1], coord[0]] as [number, number]
              );
              
              routeSegments.push(...routeCoordinates);
            }
          }
          
          setRoutePath(routeSegments);
          console.log('Routes fetched and combined');
          
        } catch (error) {
          console.error('Error fetching route:', error);
          // If there's an error fetching the route, fall back to a direct line between markers
          setRoutePath(markers.map(pos => [pos.lat, pos.lng] as [number, number]));
        } finally {
          // Clear all loading states
          setLoading(false);
          setRouteLoading(false);
          setMarkerRemovalInProgress(false);
        }
      } else {
        // Reset route when we have fewer than 2 markers
        setRoutePath([]);
        // Make sure to reset all loading states
        setLoading(false);
        setRouteLoading(false);
        setMarkerRemovalInProgress(false);
      }
    };
    
    fetchRoute();
  }, [markers]);

  // Reset markers when session becomes inactive
  useEffect(() => {
    if (!sessionActive) {
      setPositions([]);
      // Don't reset the routePath here, as we want to display it regardless of session state
    }
  }, [sessionActive]);
  
  const getMarkerIcon = (index: number, total: number) => {
    if (index === 0) return startIcon;
    if (index === total - 1) return endIcon; // Always use the total length to determine the last marker
    return midIcon;
  };
  
  // Determine if we should show the loading indicator in UI
  const showLoadingIndicator = loading || routeLoading || markerRemovalInProgress;
  
  return (
    <MapContainer 
      center={center} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MarkerManager 
        sessionActive={sessionActive} 
        onAddMarker={onAddMarker} 
        routeLoading={routeLoading}
        loading={loading || markerRemovalInProgress}
      />
      
      <MapCenterUpdater selectedRoute={selectedRoute} />
      
      {/* Draw the preset route coordinates */}
      {presetRoutePath.length > 0 && (
        <Polyline 
          positions={presetRoutePath} 
          color="#ff7800"  // Orange color for route path
          weight={4}
          opacity={0.7}
        />
      )}
      
      {/* Show start and end markers for the preset route */}
      {presetRoutePath.length > 0 && (
        <>
          <Marker 
            position={presetRoutePath[0]} 
            icon={routeStartIcon}
          >
            <Popup className="dark-theme-popup">
              Route Start
              <br />
              Lat: {presetRoutePath[0][0].toFixed(6)}, Lng: {presetRoutePath[0][1].toFixed(6)}
              {selectedRoute && (
                <div className="text-xs mt-1">
                  Route: {selectedRoute.route_name}
                </div>
              )}
            </Popup>
          </Marker>
          
          <Marker 
            position={presetRoutePath[presetRoutePath.length - 1]} 
            icon={routeEndIcon}
          >
            <Popup className="dark-theme-popup">
              Route End
              <br />
              Lat: {presetRoutePath[presetRoutePath.length - 1][0].toFixed(6)}, 
              Lng: {presetRoutePath[presetRoutePath.length - 1][1].toFixed(6)}
              {selectedRoute && (
                <div className="text-xs mt-1">
                  Route: {selectedRoute.route_name}
                </div>
              )}
            </Popup>
          </Marker>
        </>
      )}
      
      {/* Draw the device location route path */}
      {routePath.length > 0 && (
        <Polyline 
          positions={routePath} 
          color="#3388ff"  // Blue color for device path
          weight={4}
          opacity={0.8}
          dashArray="5, 10"
        />
      )}
      
      {/* Draw markers for user-clicked points (device locations) */}
      {markers.map((position, index) => (
        <Marker 
          key={`marker-${index}-${position.lat}-${position.lng}`}
          position={[position.lat, position.lng]} 
          icon={getMarkerIcon(index, markers.length)} 
        >
          <Popup className="dark-theme-popup">
            {index === 0 ? 'Start Point' : 
            index === markers.length - 1 ? 'End Point' : 
            `Waypoint ${index}`}
            <br />
            Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
            
            {sessionActive && editableTimestamps[index] !== undefined && (
              <div>
                <input 
                  type="datetime-local"
                  value={editableTimestamps[index]}
                  onChange={(e) => handleTimestampChange(e, index)}
                  className="w-full text-xs p-1 border border-gray-700 rounded-sm bg-gray-900 text-gray-300 mb-1"
                />
                <button 
                  onClick={() => saveTimestampChanges(index)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-xs rounded-md transition-colors w-full mt-1"
                >
                  Save Timestamp
                </button>
              </div>
            )}
            
            {!sessionActive && position.timestamp && (
              <div className="text-xs mt-1">
                Time: {new Date(position.timestamp).toLocaleString()}
              </div>
            )}
            
            {sessionActive && (
              <div className="mt-2">
                <button 
                  onClick={(e) => handleRemoveMarkerClick(e, index)}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs rounded-md transition-colors"
                  disabled={showLoadingIndicator}
                >
                  Remove Waypoint
                </button>
              </div>
            )}
          </Popup>
        </Marker>
      ))}
      
      {/* Loading indicator for route fetching */}
      {showLoadingIndicator && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-md text-sm z-1000">
          {markerRemovalInProgress ? "Removing waypoint..." : "Calculating route..."}
        </div>
      )}
      
      {/* Legend for the map */}
      <div className="absolute bottom-6 right-2 bg-black bg-opacity-70 text-white p-2 rounded-md text-xs z-1000">
        <div className="font-bold mb-1">Map Legend</div>
        <div className="flex items-center mb-1">
          <div className="w-4 h-2 bg-orange-500 mr-2"></div>
          <span>Preset Route</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-4 h-2 bg-blue-500 mr-2 border-t-2 border-dashed"></div>
          <span>Device Path</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span>Device Location</span>
        </div>
      </div>
    </MapContainer>
  )
}

export default ClientSideMap