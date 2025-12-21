'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import axios from 'axios'

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

interface Position {
  lat: number;
  lng: number;
  timestamp?: string; 
}

interface RouteGeometry {
  coordinates: number[][];
  type: string;
}

interface MapProps {
  sessionActive: boolean;
  markers?: Position[];
  onAddMarker?: (position: Position) => void;
  onRemoveMarker?: (index: number) => void;
  onClearMarkers?: () => void;
}

const MarkerManager = ({ sessionActive, onAddMarker }: MapProps) => {
  const [ignoreNextClick, setIgnoreNextClick] = useState(false);
  
  const map = useMapEvents({
    click: (e) => {
      if (sessionActive && !ignoreNextClick) {
        const newPosition = {
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };
        if (onAddMarker) {
          onAddMarker(newPosition);
        }
      }
      // Reset ignore flag after handling the event
      setIgnoreNextClick(false);
    }
  });
  
  // Function to set ignore flag when clicking on popups or markers
  useEffect(() => {
    const handlePopupOrMarkerClick = () => {
      setIgnoreNextClick(true);
    };
    
    // Add event listeners to any popup or marker
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.leaflet-popup') || target.closest('.leaflet-marker-icon')) {
        handlePopupOrMarkerClick();
      }
    });
    
    return () => {
      document.removeEventListener('click', () => {});
    };
  }, []);
  
  return null;
};
const ClientSideMap = ({ 
  sessionActive = false, 
  markers = [], // Add default value
  onAddMarker, 
  onRemoveMarker,
  onClearMarkers
}: MapProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [center] = useState<[number, number]>([35.6895, 139.6917]); // Tokyo as default
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
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
    
    // Small delay to prevent immediate map click
    setTimeout(() => {
      if (onRemoveMarker) {
        onRemoveMarker(index);
      }
    }, 50);
  }, [onRemoveMarker]);
  
  // Fetch route when we have at least 2 markers
  useEffect(() => {
    const fetchRoute = async () => {
      if (markers.length >= 2) {
        try {
          setLoading(true);
          
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
          setLoading(false);
        }
      } else {
        // Reset route when we have fewer than 2 markers
        setRoutePath([]);
      }
    };
    
    fetchRoute();
  }, [markers]); // Use markers from props instead of positions
  
  // Reset markers when session becomes inactive
  useEffect(() => {
    if (!sessionActive) {
      setPositions([]);
      setRoutePath([]);
    }
  }, [sessionActive]);
  
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
      
      <MarkerManager sessionActive={sessionActive} onAddMarker={onAddMarker} />
      
      {/* Draw the route using OSRM data */}
      {routePath.length > 0 && (
        <Polyline 
          positions={routePath} 
          color="#3388ff"
          weight={4}
          opacity={0.8}
          dashArray="5, 10"
        />
      )}
      
      {/* Draw markers for user-clicked points only */}
      {markers.map((position, index) => (
        <Marker 
        key={`marker-${index}-${position.lat}-${position.lng}`}
        position={[position.lat, position.lng]} 
        icon={getMarkerIcon(index, markers.length)} // Pass the total length
        >
          <Popup>
            {index === 0 ? 'Start Point' : 
            index === markers.length - 1 ? 'End Point' : 
            `Waypoint ${index}`}
            <br />
            Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
            {position.timestamp && (
              <div className="text-xs mt-1">
                Time: {new Date(position.timestamp).toLocaleTimeString()}
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
      
      {/* Loading indicator for route fetching */}
      {loading && markers.length >= 2 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-md text-sm z-1000">
          Calculating route...
        </div>
      )}
    </MapContainer>
  )
}

export default ClientSideMap