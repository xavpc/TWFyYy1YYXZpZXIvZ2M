'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { DeviceLocation } from '@/types/device-location'
import axios from 'axios'
import { createTrashCanIcon, darkPopupStyle, routeEndIcon, routeStartIcon } from '../device-simulator/client-side-map'
import { DeviceSession } from '@/types/device-session'

// Fix for Leaflet marker icons
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})


export const createCarIcon = (bearing: number, mapZoom: number) => {
  // Define actual image dimensions
  const imageWidth = 125;
  const imageHeight = 225;
  
  // Define the desired display size (adjust these values to make the icon smaller)
  const displayHeight = 40;
  const displayWidth = (imageWidth * displayHeight) / imageHeight;
  
  // Function to convert meters to pixels based on zoom level
  const metersToPixels = (meters: number, zoom: number) => {
    const earthCircumference = 40075017;
    const mapWidthInPixels = 256 * Math.pow(2, zoom);
    return (meters / earthCircumference) * mapWidthInPixels;
  };

  const glowSize = Math.max(metersToPixels(40, mapZoom), displayHeight * 1.5);

  return L.divIcon({
    className: 'custom-car-icon pointer-events-auto',
    html: `
      <div 
        style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${glowSize}px;
          height: ${glowSize}px;
          background-color: transparent;
          pointer-events: all;
        "
      >
        <!-- Glowing Circle -->
        <div 
          style="
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            animation: pulse 1.5s infinite;
          "
        ></div>
        <!-- Garbage Truck Icon -->
        <img 
          src="/images/garbage-truck-icon.png" 
          alt="Garbage Truck Icon" 
          style="
            width: ${displayWidth}px;
            height: ${displayHeight}px;
            transform: rotate(${bearing + 180}deg); /* Added 180 degrees to reverse direction */
            transform-origin: center;
            z-index: 1;
            pointer-events: all;
          "
        />
      </div>
    `,
    iconSize: [glowSize, glowSize],
    iconAnchor: [glowSize / 2, glowSize / 2]
  });
};
// const createArrowIcon = (bearing: number) => {
//   return L.divIcon({
//     className: 'custom-arrow-icon',
//     html: `
//       <svg 
//         width="40" 
//         height="40" 
//         viewBox="0 0 100 100" 
//         style="transform: rotate(${bearing}deg);"
//       >
//         <polygon 
//           points="50,90 20,10 50,30 80,10" 
//           fill="#007bff" 
//           stroke="#000" 
//           stroke-width="3"
//         />
//       </svg>
//     `,
//     iconSize: [40, 40],
//     iconAnchor: [20, 20],
//   });
// };

const calculateBearing = (
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
  
  const bearingRad = Math.atan2(y, x);
  const bearingDeg = toDegrees(bearingRad);
  
  return (bearingDeg + 360) % 360;
};


// Map View Control component to handle changing the view when data updates
function MapViewControl({
  locations,
  currentLocation,
  setZoomLevel,
}: {
  locations: DeviceLocation[];
  currentLocation?: DeviceLocation | null;
  setZoomLevel: (zoom: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      // If we have locations, fit the map to those bounds initially
      const bounds = locations.map((loc) => [
        parseFloat(loc.latitude),
        parseFloat(loc.longitude),
      ]);
      map.fitBounds(bounds as L.LatLngBoundsExpression);
    }
  }, [locations, map]);

  // When current location changes, center the map on that location
  useEffect(() => {
    if (currentLocation) {
      map.setView(
        [parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude)],
        map.getZoom()
      );
    }
  }, [currentLocation, map]);

  // Track zoom level and pass it to the parent component
  useEffect(() => {
    const handleZoom = () => {
      setZoomLevel(map.getZoom());
    };

    map.on("zoomend", handleZoom); // Listen for zoom changes
    handleZoom(); // Set the initial zoom level

    return () => {
      map.off("zoomend", handleZoom); // Cleanup listener
    };
  }, [map, setZoomLevel]);

  return null;
}

interface ClientSideMapProps {
  deviceLocations: DeviceLocation[];
  routeId: string |undefined;
  viewingSession:boolean;
  selectedSessionId: string | undefined;
  isLive: boolean;
}

const ClientSideMap = ({ deviceLocations, routeId, viewingSession, selectedSessionId, isLive = false}: ClientSideMapProps) => {
  // Default position if no locations are provided
  const defaultPosition: [number, number] = [35.6895, 139.6917]; // Tokyo as default
  
  // State for the current location index and timestamp
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderHover, setSliderHover] = useState<number | null>(null);
  const [hoverTimestamp, setHoverTimestamp] = useState<string | null>(null);
  const [routeCoordinatesLoading, setRouteCoordinatesLoading] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{
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
  }>>([]);
  const [zoomLevel, setZoomLevel] = useState(13); 
  const [collectionPoints, setCollectionPoints] = useState<Array<{
    collection_point_id: string;
    collection_point_name: string;
    latitude: string;
    longitude: string;
    route: {
      route_id: string;
      route_name: string;
      center_latitude: string;
      center_longitude: string;
    }
  }>>([]);
  const [collectionPointsLoading, setCollectionPointsLoading] = useState(false);

  const [collectedPoints, setCollectedPoints] = useState<Array<{
    collected_point_id: string;
    push_timestamp: string;
    collected_timestamp: string;
    collection_point: {
      collection_point_id: string;
      collection_point_name: string;
      latitude: string;
      longitude: string;
    }
    device: {
      device_id: string;
      device_name: string;
      vehicle_plate_num: string;
      status: string;
    };
    session: {
      session_id: string;
      start: string;
      end: string;
    };
  }>>([]);
  const [collectedPointsLoading, setCollectedPointsLoading] = useState(false);

  // Sort locations by timestamp
  const sortedLocations = useMemo(() => {
    return [...deviceLocations].sort((a, b) => 
      new Date(a.current_location_timestamp).getTime() - 
      new Date(b.current_location_timestamp).getTime()
    );
  }, [deviceLocations]);
  
  // Calculate initial position
  const initialPosition = sortedLocations.length > 0 
    ? [parseFloat(sortedLocations[0].latitude), parseFloat(sortedLocations[0].longitude)] as [number, number]
    : defaultPosition;
  
  // Current location to display
  const currentLocation = sortedLocations.length > 0 ? sortedLocations[currentIndex] : null;
  
  // Calculate the start and end timestamps for the session
  const startTimestamp = sortedLocations.length > 0 ? sortedLocations[0].current_location_timestamp : '';
  const endTimestamp = sortedLocations.length > 0 ? sortedLocations[sortedLocations.length - 1].current_location_timestamp : '';
  



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
    if (isLive && sortedLocations.length > 0) {
      const latestIndex = sortedLocations.length - 1;
      setCurrentIndex(latestIndex);
      setSliderValue(100); 
    } else {
      setSliderValue(0);
      setCurrentIndex(0);
    }
    setSliderHover(null);
    setHoverTimestamp(null);
  }, [deviceLocations, isLive]);
  useEffect(() => { 
    if(!viewingSession){
      setRouteCoordinates([]);
      setCollectionPoints([]);
      setCollectedPoints([]);
    }
  }, [viewingSession]);



  useEffect(() => {
    const fetchRouteCoordinates = async (routeId: string | undefined) => {
      if (!routeId) return;
      
      try {
        setRouteCoordinatesLoading(true);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/route-coordinates/route/${routeId}`;
        const response = await axios.get(apiUrl);
        
        if (response.data.success && response.data.data) {
          // Sort by sequence to ensure proper order
          const sortedCoordinates = response.data.data.sort(
            (a: { sequence: number }, b: { sequence: number }) => a.sequence - b.sequence
          );
          setRouteCoordinates(sortedCoordinates);
        }
      } catch (error) {
        console.error('Error fetching route coordinates:', error);
      } finally {
        setRouteCoordinatesLoading(false);
      }
    };
    
    fetchRouteCoordinates(routeId);
  }, [routeId]);

  useEffect(() => {
    const fetchCollectionPoints = async (routeId: string | undefined) => {
      if (!routeId) return;
      
      try {
        setCollectionPointsLoading(true);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/collection-points/route/${routeId}`;
        const response = await axios.get(apiUrl);
        
        if (response.data.success && response.data.data) {
          setCollectionPoints(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching collection points:', error);
      } finally {
        setCollectionPointsLoading(false);
      }
    };
    
    fetchCollectionPoints(routeId);
  }, [routeId]);

  useEffect(() => {
    const locationUpdateChannel = new BroadcastChannel('device-location-updates');
    let isMounted = true;
    
    const fetchCollectedPoints = async (sessionId: string | undefined) => {
      if (!sessionId || !viewingSession) return;
      
      try {
        setCollectedPointsLoading(true);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/collected-points/session/${sessionId}`;
        const response = await axios.get(apiUrl);
        
        if (response.data.success && response.data.data) {
          setCollectedPoints(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching collected points:', error);
      } finally {
        setCollectedPointsLoading(false);
      }
    };
    
    const handleLocationUpdate = (event: MessageEvent) => {
      if (event.data === 'device_location_updated' && isMounted) {
        fetchCollectedPoints(selectedSessionId);
      }
    };
    
    // Initial fetch
    fetchCollectedPoints(selectedSessionId);
    
    // Listen for broadcast updates
    locationUpdateChannel.addEventListener('message', handleLocationUpdate);
    
    return () => {
      isMounted = false;
      locationUpdateChannel.removeEventListener('message', handleLocationUpdate);
      locationUpdateChannel.close();
    };
  }, [selectedSessionId, viewingSession]);

  const isCollectionPointCollected = useCallback((collectionPointId: string) => {
    if (!currentLocation || sortedLocations.length === 0) return false;
    
    const matchingCollectedPoint = collectedPoints.find(point => 
      point.collection_point.collection_point_id === collectionPointId
    );
    
    if (!matchingCollectedPoint) return false;
    
    // Just use the raw strings and compare them directly
    const currentTimeStr = currentLocation.current_location_timestamp;
    const collectedTimeStr = matchingCollectedPoint.collected_timestamp;
    console.log(`current timestamp: ${currentTimeStr} collectedtimestamp: ${collectedTimeStr}`)
    console.log(`is collected? ${currentTimeStr >= collectedTimeStr}`)
    // Add the currentIndex dependency to ensure re-evaluation when timeline moves
    return currentTimeStr >= collectedTimeStr;  
  }, [currentLocation, collectedPoints, sortedLocations, currentIndex]);
  

  const formatDisplayTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      
      return `${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return timestamp;
    }
  };

  const formatPopupTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      
      // Format date in a readable format
      const year = date.getUTCFullYear();
      const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getUTCMonth()];
      const day = date.getUTCDate();
      
      // Format time
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      
      return `${month} ${day}, ${year} at ${hours}:${minutes}:${seconds} UTC+9`;
    } catch (e) {
      return timestamp;
    }
  };
  
  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    
    // Calculate which location to show based on the slider position
    if (sortedLocations.length > 0) {
      const newIndex = Math.min(
        Math.floor((newValue / 100) * (sortedLocations.length - 1)),
        sortedLocations.length - 1
      );
      setCurrentIndex(newIndex);
    }
  };
  
  // Handle slider mouseover
  const handleSliderHover = (e: React.MouseEvent<HTMLInputElement>) => {
    if (sortedLocations.length === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderHover(position);
    
    // Calculate the timestamp at hover position based on index
    const hoverIndex = Math.min(
      Math.floor((position / 100) * (sortedLocations.length - 1)),
      sortedLocations.length - 1
    );
    
    if (sortedLocations[hoverIndex]) {
      setHoverTimestamp(formatDisplayTimestamp(sortedLocations[hoverIndex].current_location_timestamp));
    }
  };
  
  // Handle slider mouseout
  const handleSliderLeave = () => {
    setSliderHover(null);
    setHoverTimestamp(null);
  };
  

  // Autoplay functionality
  useEffect(() => {
    if (!isPlaying || sortedLocations.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        
        if (newIndex >= sortedLocations.length) {
          setIsPlaying(false);
          // Reset to start position
          setCurrentIndex(0);
          setSliderValue(0);
          return 0;
        }
        
        // Update slider value
        const newSliderValue = (newIndex / (sortedLocations.length - 1)) * 100;
        setSliderValue(newSliderValue);
        
        return newIndex;
      });
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [isPlaying, sortedLocations]);
  
  // Toggle play/pause
  const togglePlay = () => {
    if (isLive) {
      console.log("Live tracking toggled");
    } else {
      setIsPlaying(!isPlaying);
    }
  };
  
  return (
    <div className='flex flex-col h-full'>
      {/* Map Timeline Controls */}
      <div 
        className={`
          relative overflow-hidden 
          ${isLive 
            ? 'bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 border-b border-blue-800' 
            : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700'}
          p-4 shadow-2xl rounded-b-xl transition-all duration-300 ease-in-out
        `}
      >
        {/* Live Tracking Indicator */}
        {isLive && (
          <div className='absolute top-3 right-4 flex items-center space-x-3'>
            <div className='relative'>
              <span className='absolute inline-flex h-4 w-4 rounded-full bg-blue-400 opacity-75 animate-ping'></span>
              <span className='relative inline-flex h-4 w-4 rounded-full bg-blue-500'></span>
            </div>
            <div className='flex flex-col'>
              <span className='text-blue-200 text-xs font-bold uppercase tracking-widest'>
                Live Tracking
              </span>
              <span className='text-blue-300 text-[10px] opacity-75'>
                Real-time Location Updates
              </span>
            </div>
          </div>
        )}

        {/* Main Controls Container */}
        <div className='flex items-center justify-between space-x-4'>
          {/* Play/Pause Button with Disabled State for Live */}
          <div className='flex items-center space-x-4'>
            <button
              className={`
                group relative flex items-center justify-center
                w-12 h-12 rounded-full 
                ${isLive 
                  ? 'bg-blue-900/20 cursor-not-allowed opacity-50' 
                  : (isPlaying 
                    ? 'bg-red-600/20 hover:bg-red-600/30 border-2 border-red-500/50' 
                    : 'bg-blue-600/20 hover:bg-blue-600/30 border-2 border-blue-500/50')}
                transition-all duration-300 ease-in-out
                transform hover:scale-105 active:scale-95
                will-change-transform
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isLive 
                  ? '' 
                  : (isPlaying 
                    ? 'focus:ring-red-500/50' 
                    : 'focus:ring-blue-500/50')}
              `}
              onClick={isLive ? undefined : togglePlay}
              disabled={isLive || sortedLocations.length === 0}
              aria-label={isLive ? "Live Tracking" : (isPlaying ? "Pause" : "Play")}
            >
              {isLive ? (
                <svg 
                  className="w-6 h-6 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              ) : (
                isPlaying ? (
                  <svg 
                    className="w-6 h-6 text-red-500 group-hover:rotate-6 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                ) : (
                  <svg 
                    className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                )
              )}
            </button>

            {/* Time Display with Advanced Styling */}
            <div className='flex items-center space-x-2'>
              {sortedLocations.length > 0 && currentLocation ? (
                <>
                  {!isLive ? (
                    <>
                  <div className='bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1.5 flex items-center space-x-2'>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className='text-xs text-gray-200 font-medium tracking-tight'>
                      {formatDisplayTimestamp(currentLocation.current_location_timestamp)}
                    </span>
                  </div>                    
                  <span className='text-gray-500 text-xs'>/</span>
                  <div className='bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1.5 flex items-center space-x-2'>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className='text-xs text-gray-200 font-medium tracking-tight'>
                      {formatDisplayTimestamp(endTimestamp)}
                    </span>
                  </div>
                  </>
                  ):(
                  <>
 <div className='flex items-center space-x-2'>
      <span className='text-gray-400 text-xs uppercase tracking-wider'>Navigated Location</span>
      <div className='bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1.5 flex items-center space-x-2'>
        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className='text-xs text-blue-200 font-medium tracking-tight'>
          {hoverTimestamp || formatDisplayTimestamp(currentLocation.current_location_timestamp)}
        </span>
      </div>
    </div>

    {/* Separator */}
    <div className='w-px h-5 bg-gray-700'></div>

    {/* Live Time Section */}
    <div className='flex items-center space-x-2'>
      <span className='text-green-400 text-xs uppercase tracking-wider'>Latest Location</span>
      <div className='bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1.5 flex items-center space-x-2'>
        <svg className="w-4 h-4 text-green-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className='text-xs text-green-200 font-medium tracking-tight'>
          {formatDisplayTimestamp(endTimestamp)}
        </span>
      </div>
    </div>
  
                  </>

                  )}
                </>
              ) : (
                <span className='text-gray-500 animate-pulse'>No location data</span>
              )}
            </div>
          </div>

          {/* Location Count - Hidden during Live Tracking */}
          {!isLive && sortedLocations.length > 0 && (
            <div className='flex items-center space-x-2'>
              <div className='bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1.5 flex items-center space-x-2'>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className='text-xs text-gray-200 font-medium tracking-tight'>
                  Location {currentIndex + 1} of {sortedLocations.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Timeline slider */}
        <div className='mt-3 relative'>
          <div className='h-1 bg-gray-700 rounded-full'>
            <div
              className='h-full bg-blue-500 rounded-full'
              style={{ width: `${sliderValue}%` }}
            ></div>
          </div>
          
          <input
            type='range'
            min='0'
            max='100'
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseMove={handleSliderHover}
            onMouseLeave={handleSliderLeave}
            className='absolute inset-0 w-full opacity-0 cursor-pointer'
            disabled={sortedLocations.length === 0}
          />
          
          {/* Slider hover tooltip */}
          {sliderHover !== null && hoverTimestamp && (
            <div
              className='absolute bottom-3 bg-gray-900 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2 z-10'
              style={{ left: `${sliderHover}%` }}
            >
              {hoverTimestamp}
            </div>
          )}
          
          {/* Current position indicator */}
          {sortedLocations.length > 0 && (
            <div
              className='absolute bottom-0 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2'
              style={{ left: `${sliderValue}%` }}
            ></div>
          )}
        </div>
      </div>
      
      {/* Map Container */}
      <div className='flex-1 overflow-hidden'>
        <MapContainer 
          center={initialPosition} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          {routeCoordinates.length > 0 && (
            <Polyline 
              positions={routeCoordinates.map(coord => [parseFloat(coord.latitude), parseFloat(coord.longitude)])} 
              color="#4338CA" 
              weight={8}      
              opacity={0.4}   
              lineJoin="round"
              lineCap="round"
              className="preset-route-outline"
            />
          )}

          {routeCoordinates.length > 0 && (
            <>
              <Marker 
                position={[parseFloat(routeCoordinates[0].latitude), parseFloat(routeCoordinates[0].longitude)]} 
                icon={routeStartIcon}
              >
                <Popup className="dark-theme-popup">
                  Route Start
                  <br />
                  Lat: {parseFloat(routeCoordinates[0].latitude).toFixed(6)}, 
                  Lng: {parseFloat(routeCoordinates[0].longitude).toFixed(6)}
                </Popup>
              </Marker>
              
              <Marker 
                position={[
                  parseFloat(routeCoordinates[routeCoordinates.length - 1].latitude), 
                  parseFloat(routeCoordinates[routeCoordinates.length - 1].longitude)
                ]} 
                icon={routeEndIcon}
              >
                <Popup className="dark-theme-popup">
                  Route End
                  <br />
                  Lat: {parseFloat(routeCoordinates[routeCoordinates.length - 1].latitude).toFixed(6)}, 
                  Lng: {parseFloat(routeCoordinates[routeCoordinates.length - 1].longitude).toFixed(6)}
                </Popup>
              </Marker>
            </>
          )}

          {/* Collection Points */}
          {collectionPoints.length > 0 && (
            <>
              {collectionPoints.map(point => (
                <Marker
                  key={point.collection_point_id}
                  position={[parseFloat(point.latitude), parseFloat(point.longitude)]}
                  icon={createTrashCanIcon(isCollectionPointCollected(point.collection_point_id))}
                >
                  <Popup className="dark-theme-popup">
                    <div className="text-sm">
                      <p className="font-bold">{point.collection_point_name}</p>
                      <p className="mt-1">
                        <span className="font-semibold">Status:</span> {isCollectionPointCollected(point.collection_point_id) ? 'Collected' : 'Not Collected'}
                      </p>
                      <p className="mt-1">
                        <span className="font-semibold">Coordinates:</span> {parseFloat(point.latitude).toFixed(6)}, {parseFloat(point.longitude).toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </>
          )}
          
          {/* Show only current location marker */}
          {currentLocation && (
            <Marker
              key={currentLocation.device_location_id}
              position={[
                parseFloat(currentLocation.latitude),
                parseFloat(currentLocation.longitude),
              ]}
              icon={createCarIcon(
                sortedLocations.length > 1
                  ? calculateBearing(
                      parseFloat(currentLocation.latitude), // Current lat
                      parseFloat(currentLocation.longitude), // Current lon
                      parseFloat(
                        sortedLocations[
                          Math.max(
                            0,
                            sortedLocations.findIndex(
                              (loc) =>
                                loc.device_location_id === currentLocation.device_location_id
                            ) - 1
                          )
                        ].latitude
                      ), // Previous lat
                      parseFloat(
                        sortedLocations[
                          Math.max(
                            0,
                            sortedLocations.findIndex(
                              (loc) =>
                                loc.device_location_id === currentLocation.device_location_id
                            ) - 1
                          )
                        ].longitude
                      ) // Previous lon
                    )
                  : 0, // Default bearing if there's only one location
                zoomLevel // Use the zoom level from state
              )}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">Device Location:</p>
                  <p>{formatPopupTimestamp(currentLocation.current_location_timestamp)}</p>
                  <p className="mt-1">
                    <span className="font-semibold">Coordinates:</span>{" "}
                    {currentLocation.latitude}, {currentLocation.longitude}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
          
          
          <MapViewControl
            locations={sortedLocations}
            currentLocation={currentLocation}
            setZoomLevel={setZoomLevel} // Pass the setter function
          />
        </MapContainer>
      </div>
    </div>
  )
}

export default ClientSideMap