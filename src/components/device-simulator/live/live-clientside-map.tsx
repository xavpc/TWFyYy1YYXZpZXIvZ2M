'use client'
import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { CollectionPoints } from '@/types/collection-points'
import { Device } from '@/types/device'
import { createTrashCanIcon, routeEndIcon, routeStartIcon } from '../client-side-map'
import axios from 'axios'
import toast from 'react-hot-toast'

// Create a vehicle icon
const defaultVehicleIcon = new L.DivIcon({
  html: `<div style="background-color: #3B82F6; border: 2px solid white; border-radius: 50%; width: 16px; height: 16px;"></div>`,
  className: 'vehicle-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8]
});

interface LiveClientSideMapProps {
  routeCoordinates: Array<{
    route_coordinates_id: string;
    latitude: string;
    longitude: string;
    sequence: number;
  }>;
  collectionPoints: Array<CollectionPoints>;
  sessionId: string | null;
  selectedDevice: Device | null;
}

interface DeviceLocationTrackerProps {
  sessionId: string | null;
  deviceId: string | undefined;
  onAddLocation: (location: {
    latitude: number;
    longitude: number;
    timestamp: string;
  }) => void;
  intervalSeconds: number;
}

interface DeviceLocation {
  id?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

const DeviceLocationTracker: React.FC<DeviceLocationTrackerProps> = ({ 
  sessionId, 
  deviceId, 
  onAddLocation, 
  intervalSeconds 
}) => {
  const map = useMapEvents({
    click: (e) => {
      if (sessionId && deviceId) {
        const { lat, lng } = e.latlng;
        onAddLocation({
          latitude: lat,
          longitude: lng,
          timestamp: new Date().toISOString()
        });
      }
    }
  });
  
  return null;
}

const LiveClientSideMap: React.FC<LiveClientSideMapProps> = ({ 
  routeCoordinates, 
  collectionPoints,
  sessionId,
  selectedDevice
}) => {
  // Default position (Tokyo) or use first coordinate if available
  const defaultPosition: [number, number] = [35.6895, 139.6917];
  const position = routeCoordinates.length > 0 
    ? [parseFloat(routeCoordinates[0].latitude), parseFloat(routeCoordinates[0].longitude)] as [number, number]
    : defaultPosition;
  
  const [deviceLocations, setDeviceLocations] = useState<DeviceLocation[]>([]);
  const [intervalSeconds, setIntervalSeconds] = useState(1);
  const lastClickTime = useRef<Date>(new Date());
  
  const handleAddDeviceLocation = async (location: {
    latitude: number;
    longitude: number;
    timestamp: string;
  }) => {
    if (!sessionId || !selectedDevice) return;
    
    // Calculate the new timestamp by adding interval seconds to the last click time
    lastClickTime.current = new Date(lastClickTime.current.getTime() + intervalSeconds * 1000);
    const timestamp = lastClickTime.current.toISOString();
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-locations/`;
      const response = await axios.post(apiUrl, {
        device_id: selectedDevice.device_id,
        latitude: location.latitude,
        longitude: location.longitude,
        current_location_timestamp: timestamp,
        session_id: sessionId
      });
      
      if (response.data.success && response.data.data) {
        // Add the new location to state
        setDeviceLocations(prev => [...prev, {
          id: response.data.data.device_location_id,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: timestamp
        }]);
        
        toast.success('Location added', {
          duration: 1000,
          style: {
            background: '#1F2937',
            color: '#FFF',
            border: '1px solid #374151',
            borderRadius: '6px',
          },
        });
      }
    } catch (error) {
      console.error('Error adding device location:', error);
      toast.error('Failed to add location', {
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#FFF',
          border: '1px solid #374151',
          borderRadius: '6px',
        },
      });
    }
  };

  return (
    <div className='relative border rounded-lg overflow-hidden' style={{ height: '500px' }}>
      {sessionId && (
        <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 p-2 rounded-md shadow-md">
          <div className="flex items-center space-x-2">
            <label htmlFor="intervalSeconds" className="text-sm font-medium">
              Seconds between locations:
            </label>
            <input
              id="intervalSeconds"
              type="number"
              min="1"
              max="60"
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 text-sm border rounded"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Click on the map to add device locations
          </p>
        </div>
      )}
      
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}{r}.png" 
          maxZoom={19}
        />
        
        {/* Route polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline 
            positions={routeCoordinates.map(coord => [
              parseFloat(coord.latitude), 
              parseFloat(coord.longitude)
            ])} 
            color="#4338CA" 
            weight={8}      
            opacity={0.4}   
            lineJoin="round"
            lineCap="round"
            className="preset-route-outline"
          />
        )}
                
        {/* Start marker */}
        {routeCoordinates.length > 0 && (
          <Marker 
            position={[parseFloat(routeCoordinates[0].latitude), parseFloat(routeCoordinates[0].longitude)]} 
            icon={routeStartIcon}
          >
            <Popup>
              Route Start
              <br />
              Lat: {parseFloat(routeCoordinates[0].latitude).toFixed(6)}, 
              Lng: {parseFloat(routeCoordinates[0].longitude).toFixed(6)}
            </Popup>
          </Marker>
        )}
        
        {/* End marker */}
        {routeCoordinates.length > 1 && (
          <Marker 
            position={[
              parseFloat(routeCoordinates[routeCoordinates.length - 1].latitude), 
              parseFloat(routeCoordinates[routeCoordinates.length - 1].longitude)
            ]} 
            icon={routeEndIcon}
          >
            <Popup>
              Route End
              <br />
              Lat: {parseFloat(routeCoordinates[routeCoordinates.length - 1].latitude).toFixed(6)}, 
              Lng: {parseFloat(routeCoordinates[routeCoordinates.length - 1].longitude).toFixed(6)}
            </Popup>
          </Marker>
        )}
        
        {/* Collection points */}
        {collectionPoints.map((point) => (
          <Marker 
            key={point.collection_point_id}
            position={[point.latitude, point.longitude]} 
            icon={createTrashCanIcon(false)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{point.collection_point_name}</p>
                <p className="mt-1">
                  <span className="font-semibold">Status:</span> Not Collected
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Coordinates:</span> {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Device locations */}
        {deviceLocations.map((location, index) => (
          <Marker 
            key={location.id || `device-location-${index}`}
            position={[location.latitude, location.longitude]} 
            icon={defaultVehicleIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">Device Location</p>
                <p className="mt-1">
                  <span className="font-semibold">Timestamp:</span> {new Date(location.timestamp).toLocaleString()}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Coordinates:</span> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Device location tracker */}
        {sessionId && (
          <DeviceLocationTracker 
            sessionId={sessionId}
            deviceId={selectedDevice?.device_id}
            onAddLocation={handleAddDeviceLocation}
            intervalSeconds={intervalSeconds}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default LiveClientSideMap