'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { DeviceLocation } from '@/types/device-location'

// Fix for Leaflet marker icons
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Map View Control component to handle changing the view when data updates
function MapViewControl({ locations, currentLocation }: { locations: DeviceLocation[], currentLocation?: DeviceLocation | null}) {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0) {
      // If we have locations, fit the map to those bounds initially
      const bounds = locations.map(loc => [parseFloat(loc.latitude), parseFloat(loc.longitude)]);
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
  
  return null;
}

interface ClientSideMapProps {
  deviceLocations: DeviceLocation[];
}

const ClientSideMap = ({ deviceLocations }: ClientSideMapProps) => {
  // Default position if no locations are provided
  const defaultPosition: [number, number] = [35.6895, 139.6917]; // Tokyo as default
  
  // State for the current location index and timestamp
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderHover, setSliderHover] = useState<number | null>(null);
  const [hoverTimestamp, setHoverTimestamp] = useState<string | null>(null);
  
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
          return prevIndex;
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
  const togglePlay = () => setIsPlaying(!isPlaying);
  
  return (
    <div className='flex flex-col h-full'>
      {/* Map Timeline Controls */}
      <div className='bg-gray-800 border-b border-gray-700 p-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={togglePlay}
              className={`p-2 rounded-full ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              disabled={sortedLocations.length === 0}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            {/* Current position time / Last timestamp */}
            <div className='text-xs text-gray-300'>
              {sortedLocations.length > 0 && currentLocation ? (
                <>
                  <span>{formatDisplayTimestamp(currentLocation.current_location_timestamp)}</span>
                  <span className='mx-1'>/</span>
                  <span>{formatDisplayTimestamp(endTimestamp)}</span>
                </>
              ) : (
                <span>No location data</span>
              )}
            </div>
          </div>
          
          {/* Location count indicator */}
          <div className='text-xs text-gray-400'>
            {sortedLocations.length > 0 ? (
              <span>
                Location {currentIndex + 1} of {sortedLocations.length}
              </span>
            ) : (
              <span>No locations</span>
            )}
          </div>
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
          />
          
          {/* Show only current location marker */}
          {currentLocation && (
            <Marker 
              key={currentLocation.device_location_id} 
              position={[parseFloat(currentLocation.latitude), parseFloat(currentLocation.longitude)]} 
              icon={icon}
            >
              <Popup>
                <div className='text-sm'>
                  <p className='font-bold'>Device Location:</p>
                  <p>{formatPopupTimestamp(currentLocation.current_location_timestamp)}</p>
                  <p className='mt-1'>
                    <span className='font-semibold'>Coordinates:</span> {currentLocation.latitude}, {currentLocation.longitude}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
          
          <MapViewControl 
            locations={sortedLocations} 
            currentLocation={currentLocation}
          />
        </MapContainer>
      </div>
    </div>
  )
}

export default ClientSideMap