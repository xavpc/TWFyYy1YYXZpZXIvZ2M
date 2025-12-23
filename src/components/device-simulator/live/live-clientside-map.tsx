'use client'
import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { CollectionPoints } from '@/types/collection-points'
import { Device } from '@/types/device'
import { createTrashCanIcon, endIcon, midIcon, routeEndIcon, routeStartIcon, startIcon } from '../client-side-map'
import axios from 'axios'
import toast from 'react-hot-toast'

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
  }) => void;
  intervalSeconds: number;
  isActive: boolean;
}

interface DeviceLocation {
  id?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

// Add seconds to a timestamp while staying in UTC
const addSecondsToTimestamp = (timestamp: string, seconds: number) => {
  const date = new Date(timestamp);
  return new Date(date.getTime() + (seconds * 1000)).toISOString();
};

const formatTimestampToISOJST = (utcTimestamp: string) => {
  const date = new Date(utcTimestamp);
  date.setHours(date.getHours() + 9); // Adjust to JST (UTC+9)
  return date.toISOString();
};

// Format a UTC timestamp to display in JST
const formatTimestampForDisplay = (utcTimestamp: string) => {
  return new Date(utcTimestamp).toLocaleString('en-US', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + ' JST';
};

const DeviceLocationTracker: React.FC<DeviceLocationTrackerProps> = ({ 
  sessionId, 
  deviceId, 
  onAddLocation,
  intervalSeconds,
  isActive
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const isProcessingRef = useRef(false); // Add this ref to track processing state
  
  const map = useMapEvents({
    click: (e) => {
      if (isActive && sessionId && deviceId && !isProcessingRef.current) {
        // Set processing flag to prevent double submissions
        isProcessingRef.current = true;
        
        const { lat, lng } = e.latlng;
        // Validate coordinates
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          onAddLocation({
            latitude: lat,
            longitude: lng
          });
        } else {
          toast.error('Invalid coordinates', {
            duration: 3000,
          });
        }
        
        // Reset the processing flag after a short delay
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 500); // 500ms debounce
      }
    }
  });
  
  useEffect(() => {
    mapRef.current = map;
    
    // Apply cursor styling based on active state
    if (map && map.getContainer()) {
      if (isActive) {
        map.getContainer().style.cursor = 'crosshair';
        map.getContainer().classList.add('crosshair-cursor'); // Add this class
      } else {
        map.getContainer().style.cursor = '';
        map.getContainer().classList.remove('crosshair-cursor'); // Remove when inactive
      }
    }
    
    return () => {
      if (map && map.getContainer()) {
        map.getContainer().style.cursor = '';
        map.getContainer().classList.remove('crosshair-cursor'); // Clean up
      }
    };
  }, [map, isActive]);
  
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
  const [showIntervalPanel, setShowIntervalPanel] = useState(true);
  const [deviceLocations, setDeviceLocations] = useState<DeviceLocation[]>([]);
  const [intervalSeconds, setIntervalSeconds] = useState(1);
  const [locationAddingEnabled, setLocationAddingEnabled] = useState(true);
  const [collectedPointsMap, setCollectedPointsMap] = useState<Record<string, boolean>>({});
  const [isCollecting, setIsCollecting] = useState<Record<string, boolean>>({});
  const lastTimestampRef = useRef<string | null>(null);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .leaflet-container.crosshair-cursor,
      .leaflet-container.crosshair-cursor .leaflet-interactive,
      .leaflet-container.crosshair-cursor .maintain-crosshair {
        cursor: crosshair !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Clean up
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  useEffect(() => {
    if (sessionId) {
      // Initialize with current time when session starts (in UTC)
      lastTimestampRef.current = new Date().toISOString();
    } else {
      // Reset when session ends
      lastTimestampRef.current = null;
      setDeviceLocations([]);
      setCollectedPointsMap({});
    }
  }, [sessionId]);

  const handleAddDeviceLocation = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    if (!sessionId || !selectedDevice?.device_id) {
      toast.error('No active session or device selected', {
        duration: 3000,
      });
      return;
    }
    
    try {
      // Calculate the next timestamp in UTC
      const currentTimestamp = lastTimestampRef.current || new Date().toISOString();
      const nextTimestamp = addSecondsToTimestamp(currentTimestamp, intervalSeconds);
      lastTimestampRef.current = nextTimestamp;
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-locations/`;
      console.log(`next timestamp: ${formatTimestampToISOJST(nextTimestamp)}`)
      const payload = {
        device_id: selectedDevice.device_id,
        latitude: location.latitude,
        longitude: location.longitude,
        current_location_timestamp: formatTimestampToISOJST(nextTimestamp),
        session_id: sessionId
      };
      
      const response = await axios.post(apiUrl, payload);
      
      if (response.data.success && response.data.data) {
        // Add the new location to state
        const newDeviceLocation = {
          id: response.data.data.device_location_id,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: nextTimestamp
        };
        
        // Add the new location to state
        setDeviceLocations(prev => [...prev, newDeviceLocation]);
        
        toast.success('Location added', {
          duration: 1000,
          style: {
            background: '#1F2937',
            color: '#FFF',
            border: '1px solid #374151',
            borderRadius: '6px',
          },
        });
      } else {
        throw new Error('API returned success: false or no data');
      }
    } catch (error) {
      console.error('Error adding device location:', error);
      toast.error('Failed to add location. Please try again.', {
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

  const handleIntervalChange = (value: number) => {
    const newValue = Math.max(1, Math.min(60, value));
    setIntervalSeconds(newValue);
  };

  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
  
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
    return R * c; // Distance in meters
  };

  const collectPoint = async (collectionPointId: string) => {
    if (!sessionId || !selectedDevice?.device_id) {
      toast.error('No active session or device selected', {
        duration: 3000,
      });
      return;
    }

    // Set collecting state for this specific point
    setIsCollecting(prev => ({
      ...prev,
      [collectionPointId]: true
    }));

    try {
      // Use the current timestamp from the last device location
      const currentTimestamp = lastTimestampRef.current || new Date().toISOString();
      
      const payload = {
        device_id: selectedDevice.device_id,
        collection_point_id: collectionPointId,
        collected_timestamp: formatTimestampToISOJST(currentTimestamp),
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
        
        // Show a success notification
        toast.success(`Collection point collected successfully`, {
          duration: 4000,
          style: {
            background: '#1F2937',
            color: '#FFF',
            border: '1px solid #374151',
            borderRadius: '6px',
          },
          icon: '✅',
        });
      } else {
        toast.error('Failed to collect point: ' + (response.data.message || 'Unknown error'), {
          duration: 3000,
        });
        console.error('Failed to collect point:', response.data.message);
      }
    } catch (error) {
      toast.error('Error collecting point. Please try again.', {
        duration: 3000,
      });
      console.error('Error collecting point:', error);
    } finally {
      // Reset collecting state
      setIsCollecting(prev => ({
        ...prev,
        [collectionPointId]: false
      }));
    }
  };

  // Check if a device location is near a collection point
  const isNearCollectionPoint = (deviceLocation: DeviceLocation, collectionPoint: CollectionPoints): boolean => {
    if (!deviceLocation) return false;
    
    const distance = calculateDistance(
      deviceLocation.latitude, deviceLocation.longitude,
      Number(collectionPoint.latitude), Number(collectionPoint.longitude)
    );
    
    // If within 30 meters radius
    return distance <= 30;
  };

  return (
    <div className='relative border rounded-lg overflow-hidden' style={{ height: '500px' }}>
      {sessionId && showIntervalPanel && (
        <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 p-3 rounded-md shadow-md">
          <div className="flex items-center justify-between mb-2">
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
                onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-sm border rounded"
              />
            </div>
            <button 
              onClick={() => setShowIntervalPanel(false)}
              className="text-gray-400 hover:text-gray-600 ml-2"
              type="button"
              aria-label="Close panel"
            >
              ×
            </button>
          </div>
          
          <div className="flex items-center mt-2">
            <input
              id="locationAddingToggle"
              type="checkbox"
              checked={locationAddingEnabled}
              onChange={() => setLocationAddingEnabled(!locationAddingEnabled)}
              className="mr-2"
            />
            <label htmlFor="locationAddingToggle" className="text-sm">
              Enable location adding
            </label>
          </div>
          
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {locationAddingEnabled 
              ? "Click on the map to add device locations" 
              : "Location adding is disabled"}
          </p>
          
          {lastTimestampRef.current && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Next location time: {formatTimestampForDisplay(lastTimestampRef.current)}
            </p>
          )}
        </div>
      )}
      
      {/* Show a button to reveal panel if hidden */}
      {sessionId && !showIntervalPanel && (
        <button
          onClick={() => setShowIntervalPanel(true)}
          className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 p-1 rounded-md shadow-md text-xs"
          type="button"
        >
          Show interval settings
        </button>
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
            className="preset-route-outline maintain-crosshair" 
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
        {collectionPoints.map((point, index) => {
          // Check if this point has been collected
          const isCollected = collectedPointsMap[point.collection_point_id] === true;
          // Check if this point is currently being collected
          const isCollectingPoint = isCollecting[point.collection_point_id] === true;
          
          // Check if the last device location is near this collection point
          const currentDeviceLocation = deviceLocations.length > 0 ? deviceLocations[deviceLocations.length - 1] : null;
          const canCollect = currentDeviceLocation ? isNearCollectionPoint(currentDeviceLocation, point) : false;
          
          return (
            <Marker 
              key={`collection-point-${point.collection_point_id || index}`}
              position={[Number(point.latitude), Number(point.longitude)]} 
              icon={createTrashCanIcon(isCollected)}
            >
              <Popup>
                <div className="font-semibold mb-1">Collection Point</div>
                {point.collection_point_name && <div className="mb-1">Name: {point.collection_point_name}</div>}
                <div className="text-xs mb-2">
                  Lat: {point.latitude}, Lng: {point.longitude}
                </div>
                
                {isCollected ? (
                  <div className="bg-green-600 text-white px-2 py-1 text-xs rounded-md w-full mt-2 text-center">
                    ✓ Already Collected
                  </div>
                ) : !sessionId || !selectedDevice ? (
                  <div className="bg-gray-500 text-white px-2 py-1 text-xs rounded-md w-full mt-2 text-center">
                    Start session to collect
                  </div>
                ) : !canCollect ? (
                  <div className="bg-yellow-500 text-white px-2 py-1 text-xs rounded-md w-full mt-2 text-center">
                    Move closer to collect
                  </div>
                ) : (
                  <button 
                    className={`${isCollectingPoint ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white px-2 py-1 text-xs rounded-md transition-colors w-full mt-2 flex justify-center items-center`}
                    onClick={() => collectPoint(point.collection_point_id)}
                    disabled={isCollectingPoint}
                  >
                    {isCollectingPoint ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Collecting...
                      </>
                    ) : (
                      'Collect Point'
                    )}
                  </button>
                )}
              </Popup>
            </Marker>
          );
        })}
        
        {/* Device locations */}
        {deviceLocations.map((location, index) => {
          // Determine which icon to use based on position
          let iconToUse = midIcon;
          let locationLabel = "Device Location";
          
          if (index === 0) {
            iconToUse = startIcon;
            locationLabel = "Start Location";
          } else if (index === deviceLocations.length - 1) {
            iconToUse = endIcon;
            locationLabel = "Current Location";
          }
          
          return (
            <Marker 
              key={location.id || `device-location-${index}`}
              position={[location.latitude, location.longitude]} 
              icon={iconToUse}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{locationLabel}</p>
                  <p className="mt-1">
                    <span className="font-semibold">Timestamp:</span> {formatTimestampForDisplay(location.timestamp)}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold">Coordinates:</span> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Device location tracker */}
        {sessionId && (
          <DeviceLocationTracker 
            sessionId={sessionId}
            deviceId={selectedDevice?.device_id}
            onAddLocation={handleAddDeviceLocation}
            intervalSeconds={intervalSeconds}
            isActive={locationAddingEnabled && !!sessionId && !!selectedDevice}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default LiveClientSideMap