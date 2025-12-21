'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import axios from 'axios'
import { CollectionPoints } from '@/types/collection-points'

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
  .custom-trash-icon {
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.7));
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

const collectionPointIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png', // Base icon (we'll customize this with SVG overlay)
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


interface Employee {
  employee_id: string
  first_name: string
  middle_name: string | null
  last_name: string
  email: string
  contact_number: string
  address: string
  age: number
  status: string
}

interface Device {
  device_id: string
  device_name: string
  vehicle_plate_num: string
  status: string
  employee: Employee
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
  collectionPoints?: CollectionPoints[];
  sessionId?:string | null;
  selectedDevice?: Device | null;
}

const createTrashCanIcon = (isCollected: boolean) => {
  // Create a custom divIcon with an embedded SVG trash can
  return L.divIcon({
    className: 'custom-trash-icon',
    html: `<div style="display: flex; justify-content: center; align-items: center; width: 28px; height: 38px; background-color: ${isCollected ? '#34D399' : '#8B5CF6'}; border-radius: 50% 50% 0 50%; transform: rotate(-45deg); box-shadow: 0 2px 4px rgba(0,0,0,0.3); border: 2px solid #ffffff;">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18" style="transform: rotate(45deg);">
               ${isCollected 
                 ? `<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>` 
                 : `<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"/>
                    <path d="M10 11v6M14 11v6"/>`}
             </svg>
           </div>`,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -38]
  });
};



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

const MarkerManager = ({ 
  sessionActive, 
  onAddMarker, 
  routeLoading,
  ignoreClicks 
}: MapProps & { 
  routeLoading: boolean,
  ignoreClicks: boolean
}) => {
  
  // Update cursor based on sessionActive, routeLoading, and ignoreClicks
  useEffect(() => {
    const mapContainer = document.querySelector('.leaflet-container') as HTMLElement;
    if (mapContainer) {
      if (routeLoading) {
        mapContainer.style.cursor = 'wait'; // Show loading cursor during route calculation
      } else if (ignoreClicks) {
        mapContainer.style.cursor = 'not-allowed'; // Show not-allowed cursor when clicks are disabled
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
  }, [sessionActive, routeLoading, ignoreClicks]);
  
  const map = useMapEvents({
    click: (e) => {
      if (sessionActive && !ignoreClicks && !routeLoading) {
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
  collectionPoints = [],
  selectedRoute = null,
  sessionId,
  selectedDevice,
}: MapProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [center, setCenter] = useState<[number, number]>([35.6895, 139.6917]); // Tokyo as default
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [presetRoutePath, setPresetRoutePath] = useState<[number, number][]>([]);
  const [editableTimestamps, setEditableTimestamps] = useState<{ [index: number]: string }>({});
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const [ignoreClicks, setIgnoreClicks] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [collectedPointsMap, setCollectedPointsMap] = useState<{[key: string]: boolean}>({});
  const [isCollecting, setIsCollecting] = useState<{[key: string]: boolean}>({});
  // Add a function to disable clicks temporarily
  const disableClicks = useCallback((duration: number) => {
    setIgnoreClicks(true);
    setTimeout(() => {
      setIgnoreClicks(false);
    }, duration);
  }, []);
  // Update center when selectedRoute changes

    // Reset markers when session becomes inactive
    useEffect(() => {
      if (!sessionActive) {
        setPositions([]);
        setCollectedPointsMap({});
        setIsCollecting({});
      }
    }, [sessionActive]);

  useEffect(() => {
    if (selectedRoute && selectedRoute.center_latitude && selectedRoute.center_longitude) {
      const lat = parseFloat(selectedRoute.center_latitude);
      const lng = parseFloat(selectedRoute.center_longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setCenter([lat, lng]);
      }
    }
  }, [selectedRoute]);

  useEffect(() => {
    const checkCollectionPointStatus = async () => {
      if (!collectionPoints || collectionPoints.length === 0 || !sessionId) return;
      
      // Create a map to store collection status
      const statusMap: {[key: string]: boolean} = {};
      
      // Check each collection point
      for (const point of collectionPoints) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/collected-points/collection-point/${point.collection_point_id}/${sessionId}`
          );
          
          if (response.data && response.data.success) {
            statusMap[point.collection_point_id] = response.data.isCollected;
          }
        } catch (error) {
          console.error(`Error checking collection point ${point.collection_point_id} status:`, error);
        }
      }
      
      setCollectedPointsMap(statusMap);
    };
    
    checkCollectionPointStatus();
  }, [collectionPoints, sessionId]);

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

  useEffect(() => {
    const mapContainer = document.querySelector('.leaflet-container') as HTMLElement;
    if (mapContainer) {
      mapContainer.style.cursor = sessionActive ? 'crosshair' : 'grab'; // Change to a crosshair when active
    }
  
    return () => {
      if (mapContainer) {
        mapContainer.style.cursor = 'grab'; // Reset cursor when session is inactive
      }
    };
  }, [sessionActive]);

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
  

  const calculateDistance = (lat1:number, lon1:number, lat2 :number, lon2:number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
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
    
    // Close the popup before removing the marker
    const popupCloseButton = document.querySelector('.leaflet-popup-close-button') as HTMLElement;
    if (popupCloseButton) {
      popupCloseButton.click();
    }
    
    // Disable map clicks directly with our local function
    disableClicks(300);
    
    // Remove the marker
    if (onRemoveMarker) {
      onRemoveMarker(index);
    }
  }, [onRemoveMarker, disableClicks]);
  
  // Fetch route when we have at least 2 markers
  useEffect(() => {
    const fetchRoute = async () => {
      // Check if we have at least 2 markers to calculate a route
      if (markers.length >= 2) {
        try {
          setRouteLoading(true); // Set route loading state to true
          
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
          setRouteLoading(false); // Set route loading state back to false
        }
      } else {
        // Reset route when we have fewer than 2 markers
        setRoutePath([]);
        // Make sure to reset loading states when we don't have enough markers
        setRouteLoading(false);
      }
    };
    
    fetchRoute();
  }, [markers]);


  const collectPoint = async (collectionPointId: string) => {
    if (!sessionId || !selectedDevice) {
      console.error("Session ID or device not selected");
      return;
    }
    
    // Set collecting state for this point
    setIsCollecting(prev => ({
      ...prev,
      [collectionPointId]: true
    }));
    
    try {
      const payload = {
        device_id: selectedDevice.device_id,
        collection_point_id: collectionPointId,
        collected_timestamp: new Date().toISOString(),
        session_id: sessionId
      };
      

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/collected-points`,
        payload
      );
      
      if (response.data && response.data.success) {
        // Update the collected points map
        setCollectedPointsMap(prev => ({
          ...prev,
          [collectionPointId]: true
        }));
        
        // Show a success notification (you can use a toast library here)
        console.log('Collection point collected successfully');
      } else {
        console.error('Failed to collect point:', response.data.message);
      }
    } catch (error) {
      console.error('Error collecting point:', error);
    } finally {
      // Reset collecting state
      setIsCollecting(prev => ({
        ...prev,
        [collectionPointId]: false
      }));
    }
  };


  
  const getMarkerIcon = (index: number, total: number) => {
    if (index === 0) return startIcon;
    if (index === total - 1) return endIcon; // Always use the total length to determine the last marker
    return midIcon;
  };
  
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
        ignoreClicks={ignoreClicks} 
      />
      
      <MapCenterUpdater selectedRoute={selectedRoute} />
      {/* Display collection points markers */}
      {collectionPoints && collectionPoints.map((point: CollectionPoints, index: number) => {
        // Check if we have markers and if the last marker is close enough to this collection point
        const hasEndMarker = markers.length > 0;
        const endMarker = hasEndMarker ? markers[markers.length - 1] : null;
        const isNearCollectionPoint = hasEndMarker && endMarker && calculateDistance(
          endMarker.lat, endMarker.lng, 
          point.latitude, point.longitude
        ) < 0.03; // 100 meters threshold (0.03 km)
        
        // Check if this point has been collected
        const isCollected = collectedPointsMap[point.collection_point_id] === true;
        // Check if this point is currently being collected
        const isCollectingPoint = isCollecting[point.collection_point_id] === true;
        
        return (
          <Marker 
            key={`collection-point-${point.collection_point_id || index}`}
            position={[point.latitude, point.longitude]} 
            icon={createTrashCanIcon(isCollected)} 
          >
            <Popup className="dark-theme-popup">
              <div className="font-semibold">Collection Point</div>
              {point.collection_point_name && <div>Name: {point.collection_point_name}</div>}
              <div className="text-xs mt-2">
                Lat: {point.latitude}, Lng: {point.longitude}
              </div>
              
              {isCollected ? (
                <div className="bg-green-600 text-white px-2 py-1 text-xs rounded-md w-full mt-3 text-center">
                  ✓ Already Collected
                </div>
              ) : (
                // Show collect button only when end marker is near and not already collected
                isNearCollectionPoint && (
                  <button 
                    className={`${isCollectingPoint ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white px-2 py-1 text-xs rounded-md transition-colors w-full mt-3 flex justify-center items-center`}
                    onClick={() => collectPoint(point.collection_point_id)}
                    disabled={isCollectingPoint || !selectedDevice}
                  >
                    {isCollectingPoint ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : !selectedDevice ? (
                      'Select a device first'
                    ) : (
                      'Collect Point'
                    )}
                  </button>
                )
              )}
            </Popup>
          </Marker>
        );
      })}      
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
                >
                  Remove Waypoint
                </button>
              </div>
            )}
          </Popup>
        </Marker>
      ))}

      {/* TODO: fix button for legend, still has bugs when clicking(generate markers behind it), small hitbox?*/}
    <div 
      className="absolute top-2 right-2 z-[9999]"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation(); 
      }} 
    >
      <button 
        className="bg-gray-800 bg-opacity-80 text-white p-2 rounded-md hover:bg-gray-700 transition-all shadow-md"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Prevent click from propagating to the map
          setShowLegend(!showLegend);
        }}
        title="Show/Hide Map Legend"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M11.625 16.5a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75z" />
          <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zm6 16.5c.66 0 1.277-.28 1.705-.783l1.44 1.44a.75.75 0 001.06-1.06l-1.44-1.44A2.625 2.625 0 1011.625 18z" clipRule="evenodd" />
        </svg>
      </button>
    </div>


      {/* Legend for the map - now with adjusted opacity */}
      {showLegend && (
        <div className="absolute bottom-6 right-2 bg-black bg-opacity-80 text-white p-2 rounded-md text-xs z-[9999] pointer-events-auto shadow-lg">
          <div className="font-bold mb-1">Map Legend</div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-2 bg-orange-500 mr-2"></div>
            <span>Preset Route</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-4 h-2 bg-blue-500 mr-2 border-t-2 border-dashed"></div>
            <span>Device Path</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Start Point</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Waypoint</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>End Point</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Route Start</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span>Route End</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            <span>Collection Point</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Collected Point</span>
          </div>
        </div>
      )}    


    </MapContainer>
  )
}

export default ClientSideMap