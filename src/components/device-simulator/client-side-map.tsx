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
}

interface RouteGeometry {
  coordinates: number[][];
  type: string;
}

interface MapProps {
  sessionActive: boolean;
  onAddMarker?: (position: Position) => void;
}

const MarkerManager = ({ sessionActive, onAddMarker }: MapProps) => {
  const map = useMapEvents({
    click: (e) => {
      if (sessionActive) {
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
  
  return null;
};

const ClientSideMap = ({ sessionActive = false, onAddMarker }: MapProps) => {
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
  
  // Fetch route when we have at least 2 markers
  useEffect(() => {
    const fetchRoute = async () => {
      if (positions.length >= 2) {
        try {
          setLoading(true);
          
          // Get start and end points
          const startPoint = positions[positions.length - 2];
          const endPoint = positions[positions.length - 1];
          
          // Build the URL with query parameters
          const routeUrl = `${process.env.NEXT_PUBLIC_API_URL}/osrm/route?start=${startPoint.lat},${startPoint.lng}&end=${endPoint.lat},${endPoint.lng}`;
          
          const response = await axios.get(routeUrl);
          
          if (response.data && response.data.routes && response.data.routes.length > 0) {
            // OSRM returns coordinates as [lng, lat], but Leaflet expects [lat, lng]
            const routeCoordinates = response.data.routes[0].geometry.coordinates.map(
              (coord: number[]) => [coord[1], coord[0]] as [number, number]
            );
            
            setRoutePath(prevRoute => [...prevRoute, ...routeCoordinates]);
            console.log('Route fetched:', routeCoordinates);
          }
        } catch (error) {
          console.error('Error fetching route:', error);
          // If there's an error fetching the route, fall back to a direct line between markers
          setRoutePath(positions.map(pos => [pos.lat, pos.lng] as [number, number]));
        } finally {
          setLoading(false);
        }
      } else {
        // Reset route when we have fewer than 2 markers
        setRoutePath([]);
      }
    };
    
    fetchRoute();
  }, [positions]);
  
  // Reset markers when session becomes inactive
  useEffect(() => {
    if (!sessionActive) {
      setPositions([]);
      setRoutePath([]);
    }
  }, [sessionActive]);
  
  const getMarkerIcon = (index: number) => {
    if (index === 0) return startIcon;
    if (index === positions.length - 1) return endIcon;
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
      
      <MarkerManager sessionActive={sessionActive} onAddMarker={handleAddMarker} />
      
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
      {positions.map((position, index) => (
        <Marker 
          key={`marker-${index}`} 
          position={[position.lat, position.lng]} 
          icon={getMarkerIcon(index)}
        >
          <Popup>
            {index === 0 ? 'Start Point' : 
             index === positions.length - 1 ? 'End Point' : 
             `Waypoint ${index}`}
            <br />
            Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
          </Popup>
        </Marker>
      ))}
      
      {/* Loading indicator for route fetching */}
      {loading && positions.length >= 2 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-md text-sm z-1000">
          Calculating route...
        </div>
      )}
    </MapContainer>
  )
}

export default ClientSideMap