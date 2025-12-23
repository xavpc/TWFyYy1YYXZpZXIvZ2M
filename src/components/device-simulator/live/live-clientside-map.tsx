'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { CollectionPoints } from '@/types/collection-points'
import { Device } from '@/types/device'
import { createTrashCanIcon, darkPopupStyle, MapCenterUpdater, routeEndIcon, routeStartIcon } from '../client-side-map'
import axios from 'axios'
import toast from 'react-hot-toast'
import MapButtons from '../map-buttons'
import { Fullscreen } from 'lucide-react'
import { DeviceRoute } from '@/types/device-route'
import { Circle } from 'react-leaflet';
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
  localDateTime: string;
  setIsFS: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDeviceRoute: DeviceRoute | null;
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
  isLoading:boolean;
}

interface DeviceLocation {
  id?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

//arrow start and mid
// export const startIcon = (bearing: number) => {
//   return L.divIcon({
//     className: 'custom-start-icon',
//     html: `
//       <div 
//         style="
//           position: relative;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           transform: rotate(${bearing - 90}deg); /* Rotate to face forward */
//           transform-origin: center;
//         "
//       >
//         <div 
//           style="
//             width: 16px; /* Slightly smaller length for the arrow line */
//             height: 3px; /* Slightly thinner line */
//             background-color: #22c55e; /* Green color for the arrow */
//             position: relative;
//           "
//         ></div>
//         <div 
//           style="
//             width: 0;
//             height: 0;
//             border-top: 5px solid transparent; /* Top side of the arrowhead */
//             border-bottom: 5px solid transparent; /* Bottom side of the arrowhead */
//             border-left: 6px solid #22c55e; /* Arrowhead color */
//             position: absolute;
//             right: -3px; /* Position the arrowhead at the end of the line */
//           "
//         ></div>
//       </div>
//     `,
//     iconSize: [18, 6], // Adjusted size
//     iconAnchor: [9, 3], // Anchor the arrow at its center
//   });
// };

// export const midIcon = (bearing: number) => {
//   return L.divIcon({
//     className: 'custom-mid-icon',
//     html: `
//       <div 
//         style="
//           position: relative;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           transform: rotate(${bearing - 90}deg); /* Rotate to face forward */
//           transform-origin: center;
//         "
//       >
//         <div 
//           style="
//             width: 16px; /* Slightly smaller length for the arrow line */
//             height: 3px; /* Slightly thinner line */
//             background-color: #3b82f6; /* Blue color for the arrow */
//             position: relative;
//           "
//         ></div>
//         <div 
//           style="
//             width: 0;
//             height: 0;
//             border-top: 5px solid transparent; /* Top side of the arrowhead */
//             border-bottom: 5px solid transparent; /* Bottom side of the arrowhead */
//             border-left: 6px solid #3b82f6; /* Arrowhead color */
//             position: absolute;
//             right: -3px; /* Position the arrowhead at the end of the line */
//           "
//         ></div>
//       </div>
//     `,
//     iconSize: [18, 6], // Adjusted size
//     iconAnchor: [9, 3], // Anchor the arrow at its center
//   });
// };



//dot start and mid

export const startIcon = (bearing: number) => {
  return L.divIcon({
    className: 'custom-start-icon',
    html: `
      <div 
        style="
          position: relative;
          width: 10px; 
          height: 10px; 
          background-color: #22c55e; /* Solid green */
          border: 2px solid #166534; /* Darker green border */
          border-radius: 50%;
        "
      ></div>
    `,
    iconSize: [10, 10],
    iconAnchor: [5, 5], // Center the icon
  });
};

export const midIcon = (bearing: number) => {
  return L.divIcon({
    className: 'custom-mid-icon',
    html: `
      <div 
        style="
          position: relative;
          width: 10px; 
          height: 10px; 
          background-color: #3b82f6; /* Solid blue */
          border: 2px solid #1d4ed8; /* Darker blue border */
          border-radius: 50%;
        "
      ></div>
    `,
    iconSize: [10, 10],
    iconAnchor: [5, 5], // Center the icon
  });
};

export const createCarIcon = (bearing: number, mapZoom: number) => {
  return L.divIcon({
    className: 'custom-car-icon',
    html: `
      <div 
        style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        <img 
          src="/images/garbage-truck-icon.png" 
          alt="Garbage Truck Icon" 
          style="
            width: 50px; 
            height: 50px; 
            transform: rotate(${bearing}deg);
            transform-origin: center;
            z-index: 1;
          "
        />
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};



export const calculateBearing = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const toDegrees = (radians: number) => radians * (180 / Math.PI);
  
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  let bearingRad = Math.atan2(y, x);
  let bearingDeg = toDegrees(bearingRad);
  
  return (bearingDeg + 360) % 360;
};


// Add seconds to a timestamp while staying in UTC
const addSecondsToTimestamp = (timestamp: string, seconds: number) => {
  const date = new Date(timestamp);
  return new Date(date.getTime() + (seconds * 1000)).toISOString();
};

export const formatTimestampToISOJST = (utcTimestamp: string) => {
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
  isActive,
  isLoading,
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
    
    // Apply cursor styling based on active state and loading state
    if (map && map.getContainer()) {
      if (isLoading) {
        map.getContainer().style.cursor = 'wait';
        map.getContainer().classList.remove('crosshair-cursor');
        map.getContainer().classList.add('wait-cursor');
      } else if (isActive) {
        map.getContainer().style.cursor = 'crosshair';
        map.getContainer().classList.add('crosshair-cursor');
        map.getContainer().classList.remove('wait-cursor');
      } else {
        map.getContainer().style.cursor = '';
        map.getContainer().classList.remove('crosshair-cursor');
        map.getContainer().classList.remove('wait-cursor');
      }
    }
    
    return () => {
      if (map && map.getContainer()) {
        map.getContainer().style.cursor = '';
        map.getContainer().classList.remove('crosshair-cursor');
        map.getContainer().classList.remove('wait-cursor');
      }
    };
  }, [map, isActive, isLoading]);
  
  return null;
}


///TODO: add loading states, and set initial time, add map buttons(full screen + legends to both session viewer and live simulator)

const LiveClientSideMap: React.FC<LiveClientSideMapProps> = ({ 
  routeCoordinates, 
  collectionPoints,
  sessionId,
  selectedDevice,
  localDateTime,
  setIsFS,
  selectedDeviceRoute
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
  const [isLoading, setIsLoading] = useState(false); // Add this line
  const [collectedPointsMap, setCollectedPointsMap] = useState<Record<string, boolean>>({});
  const [isCollecting, setIsCollecting] = useState<Record<string, boolean>>({});
  const lastTimestampRef = useRef<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [center, setCenter] = useState<[number, number]>([35.6895, 139.6917]);

    useEffect(() => {
      console.log(`selected device route: ${selectedDeviceRoute?.route.center_latitude}`)
      if (selectedDeviceRoute &&selectedDeviceRoute.route && selectedDeviceRoute.route.center_latitude && selectedDeviceRoute.route.center_longitude) {
        const lat = parseFloat(selectedDeviceRoute.route.center_latitude);
        const lng = parseFloat(selectedDeviceRoute.route.center_longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          setCenter([lat, lng]);
        }
      }
    }, [selectedDeviceRoute]);


  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = darkPopupStyle + `
      /* Make all popups dark by default */
      .leaflet-popup-content-wrapper {
        background-color: #1f2937;
        color: #e5e7eb;
        border: 1px solid #374151;
      }
      .leaflet-popup-tip {
        background-color: #1f2937;
        border-left: 1px solid #374151;
        border-top: 1px solid #374151;
      }
      /* Other popup styles */
      .leaflet-marker-icon {
        cursor: pointer !important;
      }
      .leaflet-marker-wait {
        cursor: wait !important;
      }
      .leaflet-marker-disabled {
        cursor: not-allowed !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .leaflet-container.crosshair-cursor,
      .leaflet-container.crosshair-cursor .leaflet-interactive:not(.leaflet-marker-icon) {
        cursor: crosshair !important;
      }
      
      .leaflet-container.wait-cursor,
      .leaflet-container.wait-cursor .leaflet-interactive:not(.leaflet-marker-icon) {
        cursor: wait !important;
      }
      
      /* Always ensure markers have pointer cursor */
      .leaflet-marker-icon,
      .leaflet-container.crosshair-cursor .leaflet-marker-icon {
        cursor: pointer !important;
      }
      
      /* Override for waiting state on markers */
      .leaflet-container.wait-cursor .leaflet-marker-icon {
        cursor: wait !important;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Clean up
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
      // Find the map container element safely
      const mapElement = document.querySelector('.leaflet-container');
      if (!mapElement) return; // Exit if not found
      
      const mapContainer = mapElement.parentElement;
      if (!mapContainer) return; // Exit if parent not found
      
      if (isFullScreen) {
        // Store original styles
        const originalPosition = mapContainer.style.position;
        const originalZIndex = mapContainer.style.zIndex;
        const originalWidth = mapContainer.style.width;
        const originalHeight = mapContainer.style.height;
        const originalTop = mapContainer.style.top;
        const originalLeft = mapContainer.style.left;
        const originalRight = mapContainer.style.right;
        const originalBottom = mapContainer.style.bottom;
    
        // Apply full-screen styles
        mapContainer.style.position = 'fixed';
        mapContainer.style.top = '0';
        mapContainer.style.left = '0';
        mapContainer.style.right = '0';
        mapContainer.style.bottom = '0';
        mapContainer.style.width = '100vw';
        mapContainer.style.height = '100vh';
        mapContainer.style.zIndex = '9999';
    
        // Store original styles as data attributes
        mapContainer.dataset.originalPosition = originalPosition;
        mapContainer.dataset.originalZIndex = originalZIndex;
        mapContainer.dataset.originalWidth = originalWidth;
        mapContainer.dataset.originalHeight = originalHeight;
        mapContainer.dataset.originalTop = originalTop;
        mapContainer.dataset.originalLeft = originalLeft;
        mapContainer.dataset.originalRight = originalRight;
        mapContainer.dataset.originalBottom = originalBottom;
      } else {
        // Only restore if we have stored original values
        if (mapContainer.dataset.originalPosition !== undefined) {
          // Restore original styles
          mapContainer.style.position = mapContainer.dataset.originalPosition || '';
          mapContainer.style.zIndex = mapContainer.dataset.originalZIndex || '';
          mapContainer.style.width = mapContainer.dataset.originalWidth || '';
          mapContainer.style.height = mapContainer.dataset.originalHeight || '';
          mapContainer.style.top = mapContainer.dataset.originalTop || '';
          mapContainer.style.left = mapContainer.dataset.originalLeft || '';
          mapContainer.style.right = mapContainer.dataset.originalRight || '';
          mapContainer.style.bottom = mapContainer.dataset.originalBottom || '';
          
          // Clean up dataset
          delete mapContainer.dataset.originalPosition;
          delete mapContainer.dataset.originalZIndex;
          delete mapContainer.dataset.originalWidth;
          delete mapContainer.dataset.originalHeight;
          delete mapContainer.dataset.originalTop;
          delete mapContainer.dataset.originalLeft;
          delete mapContainer.dataset.originalRight;
          delete mapContainer.dataset.originalBottom;
        }
      }
      
      // Trigger a resize event to update the map
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }, [isFullScreen]);

  
  useEffect(() => {
    if (sessionId && localDateTime) {
      console.log(`localdatetime: ${localDateTime}`);
      
      const jstDateTimeString = `${localDateTime}:00+09:00`;
      
      const date = new Date(jstDateTimeString);
      
      lastTimestampRef.current = date.toISOString();
      console.log(`UTC timestamp: ${lastTimestampRef.current}`);
    } else {
      lastTimestampRef.current = null;
      setDeviceLocations([]);
      setCollectedPointsMap({});
    }
  }, [sessionId, localDateTime]);
  useEffect(() => {
    if(isFullScreen){
      setIsFS?.(true)
    }
    else{
      setIsFS?.(false)
    }
  }, [isFullScreen]);

  const toggleFullScreen = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsFullScreen(prev => !prev);
  }, []);

  const locationUpdateChannel = new BroadcastChannel('device-location-updates');
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
    setIsLoading(true);


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
        locationUpdateChannel.postMessage('device_location_updated');
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
    finally {
      setIsLoading(false); 
    }
  };

  const handleIntervalChange = (value: number) => {
    const newValue = Math.max(1, Math.min(60, value));
    setIntervalSeconds(newValue);
  };

  const removeTimezoneNotation = (timestamp: string): string => {
    // Simply cut off everything from the decimal point (for milliseconds) or 'Z' (for timezone)
    const timeWithoutMilliseconds = timestamp.split('.')[0];
    
    // Remove the 'Z' if it's there (in case there are no milliseconds)
    return timeWithoutMilliseconds.replace('Z', '');
  }

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
        collected_timestamp: removeTimezoneNotation(formatTimestampToISOJST(currentTimestamp)),
        session_id: sessionId
      };
      console.log(`collect point timestamp ${ removeTimezoneNotation(formatTimestampToISOJST(currentTimestamp))}`)
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
        setIsLoading(true);
        // Show a success notification
        locationUpdateChannel.postMessage('device_location_updated');
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

      setIsLoading(false);
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
    return distance <= 20;
  };

  return (
    <div className='relative border rounded-lg overflow-hidden' style={{ height: '500px' }}>
      {sessionId && showIntervalPanel && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 p-3 rounded-md shadow-md">
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
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 p-1 rounded-md shadow-md text-xs"
          type="button"
        >
          Show interval settings
        </button>
      )}
      
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
      <MapButtons 
        setIsFullScreen={setIsFullScreen}
        setShowLegend={setShowLegend}
        
      />
      
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          maxZoom={19}
        />
        <MapCenterUpdater selectedRoute={selectedDeviceRoute?.route} />
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
          let iconToUse;
          let locationLabel = "Device Location";

          // Calculate bearing for current location
          let bearing = 0;
          if (index < deviceLocations.length - 1) {
            // Calculate bearing to next location
            bearing = calculateBearing(
              location.latitude,
              location.longitude,
              deviceLocations[index + 1].latitude,
              deviceLocations[index + 1].longitude
            );
          } else if (index > 0) {
            // For last location, use bearing from previous location
            bearing = calculateBearing(
              deviceLocations[index - 1].latitude,
              deviceLocations[index - 1].longitude,
              location.latitude,
              location.longitude
            );
          }

          if (index === 0 && deviceLocations.length === 1) {
            // If it's the only location, use the car icon
            iconToUse = createCarIcon(bearing, 13);
            locationLabel = "Current Location";
          } else if (index === 0) {
            iconToUse = startIcon(bearing); // Pass bearing to startIcon
            locationLabel = "Start Location";
          } else if (index === deviceLocations.length - 1) {
            iconToUse = createCarIcon(bearing, 13); // Use calculated bearing
            locationLabel = "Current Location";
          } else {
            iconToUse = midIcon(bearing); // Pass bearing to midIcon
            locationLabel = "Device Location";
          }

          return (
            <React.Fragment key={location.id || `device-location-${index}`}>
              <Marker 
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
                    <p className="mt-1">
                      <span className="font-semibold">Bearing:</span> {bearing.toFixed(2)}°
                    </p>
                  </div>
                </Popup>
              </Marker>

            {/* Add a 20-meter radius circle around the current location */}
              {index === deviceLocations.length - 1 && (
                <Circle
                  center={[location.latitude, location.longitude]} // Center at the car's current location
                  radius={20} // 20 meters
                  pathOptions={{
                    color: '#3b82f6', // Blue color for the circle
                    fillColor: '#3b82f6',
                    fillOpacity: 0.2, // Slightly transparent
                  }}
                />
              )}
            </React.Fragment>
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
            isLoading={isLoading}
          />
        )}

            {/* Legend for the map */}
            {showLegend && (
        <div className="absolute bottom-6 right-2 bg-black bg-opacity-80 text-white p-3 rounded-md text-xs z-[9999] pointer-events-auto shadow-lg">
          <div className="font-bold mb-2 text-sm">Map Legend</div>
          
          <div className="flex items-center mb-2">
            <div className="w-4 h-2 bg-indigo-500 mr-2 rounded-sm"></div>
            <span>Preset Route</span>
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="#10B981">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>Start Point</span>
            </div>
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="#3B82F6">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>Waypoint</span>
            </div>
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="#EF4444">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>End Point</span>
            </div>
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="#F59E0B">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>Route Start</span>
            </div>
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="#F97316">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>Route End</span>
            </div>
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="#8B5CF6">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
              </svg>
              <span>Collection Point</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="#34D399">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
              </svg>
              <span>Collected Point</span>
            </div>
          </div>
        </div>
      )}
      </MapContainer>
    </div>
  )
}

export default LiveClientSideMap