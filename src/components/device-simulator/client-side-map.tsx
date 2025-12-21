'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

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
    </MapContainer>
  )
}

export default ClientSideMap