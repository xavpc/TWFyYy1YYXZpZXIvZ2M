'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Custom marker icons
const startIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'marker-start' // We'll use this for styling
})

const midIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'marker-mid'
})

const endIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'marker-end'
})

// Custom CSS to override the marker colors
const customStyles = `
  .marker-start .leaflet-marker-icon {
    filter: hue-rotate(120deg); /* Green */
  }
  .marker-mid .leaflet-marker-icon {
    filter: hue-rotate(200deg); /* Blue */
  }
  .marker-end .leaflet-marker-icon {
    filter: hue-rotate(0deg); /* Red */
  }
`;

interface Position {
  lat: number;
  lng: number;
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
  
  // Handle marker additions
  const handleAddMarker = useCallback((position: Position) => {
    setPositions(prev => [...prev, position]);
    if (onAddMarker) {
      onAddMarker(position);
    }
  }, [onAddMarker]);
  
  // Reset markers when session becomes inactive
  useEffect(() => {
    if (!sessionActive) {
      setPositions([]);
    }
  }, [sessionActive]);
  
  const getMarkerIcon = (index: number) => {
    if (index === 0) return startIcon;
    if (index === positions.length - 1) return endIcon;
    return midIcon;
  };
  
  return (
    <div className='border rounded-lg overflow-hidden' style={{ height: '500px' }}>
      <style>{customStyles}</style>
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MarkerManager sessionActive={sessionActive} onAddMarker={handleAddMarker} />
        
        {/* Draw markers */}
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
            </Popup>
          </Marker>
        ))}
        
        {/* Draw connecting lines */}
        {positions.length > 1 && (
          <Polyline 
            positions={positions.map(pos => [pos.lat, pos.lng])} 
            color="#3388ff"
            weight={4}
            opacity={0.7}
            dashArray="5, 10"
          />
        )}
      </MapContainer>
    </div>
  )
}

export default ClientSideMap