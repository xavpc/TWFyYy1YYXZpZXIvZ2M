'use client'
import React, { JSX, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import axios from 'axios'

// Dynamically import the map component with SSR disabled
const Map = dynamic(
  () => import('./client-side-map'),
  { ssr: false }
)

const DeviceSimulatorMap = (): JSX.Element => {
  const t = useTranslations('Layout')
  const devsim = useTranslations('Device Simulator')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const [markers, setMarkers] = useState<Array<{lat: number, lng: number}>>([])
  const [routeInfo, setRouteInfo] = useState<{
    distance: number | null,
    duration: number | null
  }>({ distance: null, duration: null })
  
  const handleStartSession = async () => {
    try {
      setLoading(true)
      console.log('Start session clicked')
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-sessions/`
      const response = await axios.post(apiUrl)
      console.log('Session started successfully:', response.data)
      
      if (response.data.success && response.data.data) {
        setSessionId(response.data.data.session_id)
        setSessionStartTime(response.data.data.start)
        setMarkers([]) // Clear any previous markers
        setRouteInfo({ distance: null, duration: null }) // Reset route info
      }
      
    } catch (error) {
      console.error('Error starting session:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddMarker = (position: {lat: number, lng: number}) => {
    setMarkers(prev => [...prev, position])
    console.log('Added marker at:', position)
  }
  
  const handleRemoveMarker = (index: number) => {
    setMarkers(prev => {
      const newMarkers = [...prev];
      newMarkers.splice(index, 1);
      return newMarkers;
    });
    console.log('Removed marker at index:', index);
    
    // Reset route info to recalculate after marker removal
    setRouteInfo({ distance: null, duration: null });
  }
  
  const handleClearAllWaypoints = () => {
    if (sessionId) {
      setMarkers([]);
      setRouteInfo({ distance: null, duration: null });
      console.log('Cleared all waypoints');
    }
  }
  
  // Fetch route information when markers change
  useEffect(() => {
    const fetchRouteInfo = async () => {
      if (markers.length >= 2) {
        try {
          let totalDistance = 0;
          let totalDuration = 0;
          
          // Calculate route info for each segment
          for (let i = 0; i < markers.length - 1; i++) {
            const startPoint = markers[i];
            const endPoint = markers[i + 1];
            
            // Build the URL with query parameters
            const routeUrl = `${process.env.NEXT_PUBLIC_API_URL}/osrm/route?start=${startPoint.lat},${startPoint.lng}&end=${endPoint.lat},${endPoint.lng}`;
            
            const response = await axios.get(routeUrl);
            
            if (response.data && response.data.routes && response.data.routes.length > 0) {
              const route = response.data.routes[0];
              totalDistance += route.distance;
              totalDuration += route.duration;
            }
          }
          
          setRouteInfo({
            distance: totalDistance,
            duration: totalDuration,
          });
          console.log('Route info updated, total distance:', totalDistance);
        } catch (error) {
          console.error('Error fetching route info:', error);
        }
      } else {
        // Reset route info when we have fewer than 2 markers
        setRouteInfo({ distance: null, duration: null });
      }
    };
    
    fetchRouteInfo();
  }, [markers]);
  
  // Format the session start time for display
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString()
  }
  
  // Format the distance in meters to a more readable format
  const formatDistance = (meters: number | null) => {
    if (meters === null) return '-';
    return meters < 1000 
      ? `${meters.toFixed(1)} m` 
      : `${(meters / 1000).toFixed(2)} km`;
  }
  
  // Format the duration in seconds to a more readable format
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '-';
    
    if (seconds < 60) {
      return `${seconds.toFixed(0)} sec`;
    } else if (seconds < 3600) {
      const minutes = seconds / 60;
      return `${minutes.toFixed(0)} min`;
    } else {
      const hours = seconds / 3600;
      return `${hours.toFixed(1)} hr`;
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">{t('Device Simulator')}</h1>
        
        {!sessionId ? (
          <button 
            onClick={handleStartSession}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {devsim('Starting')}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                {devsim('Start Session')}
              </>
            )}
          </button>
        ) : (
          <div className="text-green-400 flex items-center gap-2">
            <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
            {devsim('Session Active')}
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-gray-900">
        {/* Left Panel - Session Info */}
        <div className="lg:col-span-1">
          {sessionId ? (
            <div className="bg-gray-800 border border-gray-700 rounded-md shadow-md h-full p-4">
              <h3 className="font-semibold text-green-400 text-lg border-b border-gray-700 pb-2 mb-4">{devsim('Active Session')}</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Session ID</p>
                  <p className="font-mono bg-gray-900 px-2 py-1 rounded text-green-300 text-xs overflow-hidden overflow-ellipsis">{sessionId}</p>
                </div>
                
                {sessionStartTime && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Started</p>
                    <p className="bg-gray-900 px-2 py-1 rounded text-blue-300 text-xs">{formatTime(sessionStartTime)}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Points</p>
                  <p className="bg-gray-900 px-2 py-1 rounded text-yellow-300 text-xs">{markers.length}</p>
                </div>
                
                {/* Route Information */}
                {markers.length >= 2 && (
                  <div className="pt-3 pb-3 border-t border-b border-gray-700">
                    <h4 className="text-sm font-semibold text-white mb-2">Route Information</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Distance</p>
                        <p className="bg-gray-900 px-2 py-1 rounded text-purple-300 text-xs">{formatDistance(routeInfo.distance)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Duration</p>
                        <p className="bg-gray-900 px-2 py-1 rounded text-orange-300 text-xs">{formatDuration(routeInfo.duration)}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-3">
                  <h4 className="text-sm font-semibold text-white mb-2">Instructions</h4>
                  <ul className="text-sm text-gray-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-green-500 flex-shrink-0"></div>
                      <span>Click on map to add starting point</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <span>Continue adding waypoints as needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-red-500 flex-shrink-0"></div>
                      <span>Last point marks the destination</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
                      <span>Click a marker and use popup to remove it</span>
                    </li>
                  </ul>
                </div>
                
                {/* Clear All Waypoints Button */}
                {markers.length > 0 && (
                  <button
                    onClick={handleClearAllWaypoints}
                    className="w-full mt-2 bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-md transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Waypoints
                  </button>
                )}
                
                {/* Marker Coordinates List */}
                {markers.length > 0 && (
                  <div className="pt-3 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-white mb-2">Waypoints</h4>
                    <div className="max-h-48 overflow-y-auto pr-2">
                      {markers.map((marker, index) => (
                        <div 
                          key={`coord-${index}`} 
                          className="text-xs mb-2 p-2 rounded bg-gray-900 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div 
                              className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${
                                index === 0 ? 'bg-green-500' : 
                                index === markers.length - 1 ? 'bg-red-500' : 'bg-blue-500'
                              }`}
                            ></div>
                            <div>
                              <span className="text-gray-400 mr-1">
                                {index === 0 ? 'Start:' : 
                                 index === markers.length - 1 ? 'End:' : 
                                 `Point ${index}:`}
                              </span>
                              <span className="font-mono">
                                {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveMarker(index)}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Remove waypoint"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-md shadow-md h-full p-4 flex flex-col items-center justify-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h3 className="text-lg text-gray-300 font-medium">{devsim('Device Simulator')}</h3>
              <p className="text-gray-500 mt-2 text-sm">Start a session to begin creating a route on the map</p>
            </div>
          )}
        </div>
        
        {/* Right Panel - Map */}
        <div className="lg:col-span-3 h-[600px] bg-gray-800 border border-gray-700 rounded-md shadow-md overflow-hidden">
        <Map 
          sessionActive={!!sessionId} 
          onAddMarker={handleAddMarker} 
          onRemoveMarker={handleRemoveMarker}
          markers={markers}  // Add this line to pass markers down
          onClearMarkers={handleClearAllWaypoints}  // Add this line for clear function
        />
        </div>
      </div>
    </div>
  )
}

export default DeviceSimulatorMap