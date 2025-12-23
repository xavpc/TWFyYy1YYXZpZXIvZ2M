'use client'
import React, { JSX, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { Toaster, toast } from 'react-hot-toast';
import { useRef } from 'react'
import { CollectionPoints } from '@/types/collection-points'
import { Device } from '@/types/device'
import { Employee } from '@/types/employees'
import { Route } from '@/types/route'
import { DeviceRoute } from '@/types/device-route'
// Dynamically import the map component with SSR disabled
const Map = dynamic(() => import('./client-side-map'), { ssr: false })







const DeviceSimulatorMap = (): JSX.Element => {
  const t = useTranslations('Layout')
  const devsim = useTranslations('Device Simulator')
  const [loading, setLoading] = useState(false)
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null)
  const [markers, setMarkers] = useState<Array<{ lat: number; lng: number; timestamp: string; }>>(
    []
  )
  const [routeInfo, setRouteInfo] = useState<{
    distance: number | null
    duration: number | null
  }>({ distance: null, duration: null })
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSendingLocations, setIsSendingLocations] = useState(false)
  const [sendingProgress, setSendingProgress] = useState(0)
  const [routes, setRoutes] = useState<Array<Route>>([]);
  const [collectionPoints, setCollectionPoints] = useState<Array<CollectionPoints>>([])
  const [deviceRoutes, setDeviceRoutes] = useState<DeviceRoute[]>([]);
  const [selectedDeviceRoute, setSelectedDeviceRoute] = useState<DeviceRoute | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [deviceRoutesLoading, setDeviceRoutesLoading] = useState(false);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [deviceSearchQuery, setDeviceSearchQuery] = useState<string>('');
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
  const [isRouteDropdownOpen, setIsRouteDropdownOpen] = useState(false);
  const [routeCoordinatesLoading, setRouteCoordinatesLoading] = useState(false);
  const [isTimestampUpdate, setIsTimeStampUpdate] = useState(false);
  
  useEffect(() => {
    if (selectedDeviceRoute && selectedDeviceRoute.route.route_id) {
      fetchCollectionPoints(selectedDeviceRoute.route.route_id);
    } else {
      // Clear collection points if no route is selected
      setCollectionPoints([]);
    }
  }, [selectedDeviceRoute]);


  useEffect(() => {
    const fetchRoute = async (routeId: string| undefined) => {
      if (!routeId) return;
  
      try {
        setRoutesLoading(true);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/routes/${routeId}`;
        const response = await axios.get(apiUrl);
        
        // For better debugging, use JSON.stringify
        console.log(`response data:`, JSON.stringify(response.data.data));
        
        if (response.data.success && response.data.data) {
          // Set just the data property, not the whole response
          setRoute(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      } finally {
        setRoutesLoading(false);
      }
    };
  
    fetchRoute(selectedDeviceRoute?.route.route_id);
  }, [selectedDeviceRoute]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setRoutesLoading(true);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/routes/`;
        const response = await axios.get(apiUrl);
  
        if (response.data.success && response.data.data) {
          setRoutes(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setRoutesLoading(false);
      }
    };
  
    fetchRoutes();
  }, []);

  // Fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setDevicesLoading(true)
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/devices/`
        const response = await axios.get(apiUrl)

        if (response.data.success && response.data.data) {
          setDevices(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching devices:', error)
      } finally {
        setDevicesLoading(false)
      }
    }

    fetchDevices()
  }, [])

  const fetchDeviceRoutes = async (deviceId: string) => {
    if (!deviceId) return;
    
    try {
      setDeviceRoutesLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-routes/device/${deviceId}`;
      const response = await axios.get(apiUrl);
  
      if (response.data.success && response.data.data) {
        setDeviceRoutes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching device routes:', error);
      toast.error('Failed to load routes for this device', {
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#FFF',
          border: '1px solid #374151',
          borderRadius: '6px',
        },
      });
    } finally {
      setDeviceRoutesLoading(false);
    }
  };

  const filteredDevices = devices.filter(device => {
    const searchTerm = deviceSearchQuery.toLowerCase();
    const deviceName = device.device_name.toLowerCase();
    const plateNumber = device.vehicle_plate_num.toLowerCase();
    const employeeName = `${device.employee.first_name} ${device.employee.last_name}`.toLowerCase();
    
    return deviceName.includes(searchTerm) || 
           plateNumber.includes(searchTerm) || 
           employeeName.includes(searchTerm);
  });

  const fetchCollectionPoints = async (routeId: string) => {
    if (!routeId) return;
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/collection-points/route/${routeId}`;
      const response = await axios.get(apiUrl);
      
      if (response.data.success && response.data.data) {
        setCollectionPoints(response.data.data);
      }
      console.log(`collection point fetched: ${response.data.data}`)
    } catch (error) {
      console.error('Error fetching collection points:', error);
      toast.error('Failed to load collection points for this route', {
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

  
  
  const fetchRouteCoordinates = async (routeId: string) => {
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



  const handleSendLocations = async () => {
    if (!sessionId || !selectedDevice || markers.length < 2) {
      toast.error('You need an active session with at least 2 waypoints to send locations', {
        duration: 4000,
        style: {
          background: '#1F2937',
          color: '#FFF',
          border: '1px solid #374151',
          borderRadius: '6px',
        },
      });
      return;
    }
  
    const loadingToastId = toast.loading('Preparing location data...', {
      style: {
        background: '#1F2937',
        color: '#FFF',
        border: '1px solid #374151',
        borderRadius: '6px',
      },
    });
    
    try {
      setIsSendingLocations(true);
      setSendingProgress(0);
      
      // Prepare the batch payload
      const batchPayload = markers.map(marker => ({
        device_id: selectedDevice.device_id,
        latitude: marker.lat,
        longitude: marker.lng,
        current_location_timestamp: marker.timestamp,
        session_id: sessionId
      }));
      
      // Update loading toast
      toast.loading(`Sending ${markers.length} locations in batch...`, {
        id: loadingToastId,
        style: {
          background: '#1F2937',
          color: '#FFF',
          border: '1px solid #374151',
          borderRadius: '6px',
        },
      });
      
      // Send the batch request
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/device-locations/batch`, batchPayload);
      
      // Set progress to 100% since all locations are sent at once
      setSendingProgress(100);
      
      // Success toast
      toast.success('All locations sent successfully!', {
        id: loadingToastId,
        duration: 4000,
        style: {
          background: '#1F2937',
          color: '#FFF',
          border: '1px solid #374151',
          borderRadius: '6px',
        },
        icon: '✅',
      });
    } catch (error) {
      console.error('Error sending locations:', error);
      
      // Error toast
      toast.error('Error sending locations. See console for details.', {
        id: loadingToastId,
        duration: 5000,
        style: {
          background: '#1F2937',
          color: '#FFF',
          border: '1px solid #374151',
          borderRadius: '6px',
        },
        icon: '❌',
      });
    } finally {
      setIsSendingLocations(false);
    }
  };


  const handleEndSession = async () => {
    if (!sessionId) {
      return;
    }
  
    try {
      setLoading(true);

      await handleSendLocations()
      console.log('Ending session:', sessionId);
  
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-sessions/${sessionId}/end`;
      const response = await axios.put(apiUrl);
      
      console.log('Session ended successfully:', response.data);
  
      if (response.data.success) {
        setSessionId(null);
        setSessionStartTime(null);
        setMarkers([]);
        setRouteInfo({ distance: null, duration: null });
      }
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleStartSession = async () => {
    if (!selectedDevice) {
      // Show an alert or notification that a device must be selected
      alert('Please select a device first')
      return
    }


    try {
      setLoading(true)
      console.log('Start session clicked for route:', selectedDeviceRoute?.route.route_id)
      console.log(`route data: ${route?.center_latitude, route?.center_longitude}`)
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-sessions/`
      const response = await axios.post(apiUrl, {
        route_id: selectedDeviceRoute?.route.route_id,
        device_route_id: selectedDeviceRoute?.device_route_id
      })
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

  const handleAddMarker = (position: { lat: number; lng: number }) => {
    const now = new Date();
    // Convert to Japan Standard Time (JST)
    const jstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    setMarkers((prev) => [...prev, {
      ...position,
      timestamp: jstTime.toISOString()
    }]);
    console.log('Added marker at:', position);
   };

  const handleRemoveMarker = (index: number) => {
    setMarkers((prev) => {
      const newMarkers = [...prev]
      newMarkers.splice(index, 1)
      return newMarkers
    })
    console.log('Removed marker at index:', index)

    // Reset route info to recalculate after marker removal
    setRouteInfo({ distance: null, duration: null })
  }

  const handleUpdateMarkerTimestamp = (index: number, newTimestamp: string) => {
    setMarkers((prev) => {
      const newMarkers = [...prev];
      if (newMarkers[index]) {
        newMarkers[index] = {
          ...newMarkers[index],
          timestamp: newTimestamp
        };
      }
      return newMarkers;
    });
    setIsTimeStampUpdate(true)
    console.log(`Updated timestamp for marker ${index} to ${newTimestamp}`);
  };

  const handleClearAllWaypoints = () => {
    if (sessionId) {
      setMarkers([])
      setRouteInfo({ distance: null, duration: null })
      console.log('Cleared all waypoints')
    }
  }

  // Fetch route information when markers change
  useEffect(() => {
    const fetchRouteInfo = async () => {
      if (markers.length >= 2) {
        try {
          let totalDistance = 0
          let totalDuration = 0

          // Calculate route info for each segment
          for (let i = 0; i < markers.length - 1; i++) {
            const startPoint = markers[i]
            const endPoint = markers[i + 1]

            // Build the URL with query parameters
            const routeUrl = `${process.env.NEXT_PUBLIC_API_URL}/osrm/route?start=${startPoint.lat},${startPoint.lng}&end=${endPoint.lat},${endPoint.lng}`

            const response = await axios.get(routeUrl)

            if (
              response.data &&
              response.data.routes &&
              response.data.routes.length > 0
            ) {
              const route = response.data.routes[0]
              totalDistance += route.distance
              totalDuration += route.duration
            }
          }

          setRouteInfo({
            distance: totalDistance,
            duration: totalDuration,
          })
          console.log('Route info updated, total distance:', totalDistance)
        } catch (error) {
          console.error('Error fetching route info:', error)
        }
      } else {
        // Reset route info when we have fewer than 2 markers
        setRouteInfo({ distance: null, duration: null })
      }
    }

    fetchRouteInfo()
  }, [markers])

  // Format the session start time for display
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString()
  }

  // // Format the distance in meters to a more readable format
  // const formatDistance = (meters: number | null) => {
  //   if (meters === null) return '-'
  //   return meters < 1000
  //     ? `${meters.toFixed(1)} m`
  //     : `${(meters / 1000).toFixed(2)} km`
  // }

  // Format the duration in seconds to a more readable format
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '-'

    if (seconds < 60) {
      return `${seconds.toFixed(0)} sec`
    } else if (seconds < 3600) {
      const minutes = seconds / 60
      return `${minutes.toFixed(0)} min`
    } else {
      const hours = seconds / 3600
      return `${hours.toFixed(1)} hr`
    }
  }

  // Function to get device display name
  const getDeviceDisplayName = (device: Device) => {
    return `${device.device_name} (${device.vehicle_plate_num})`
  }

  // Function to get employee display name
  const getEmployeeDisplayName = (employee: Employee) => {
    return `${employee.first_name} ${employee.last_name}`
  }
  
  const handleStartLiveSession = () => {
    // You can adjust the URL to point to your live session page
    const liveSessionUrl = `/device-simulator/live`;
    
    // Open the URL in a new tab
    window.open(liveSessionUrl, '_blank');
  };

  
  return (
    <div className='flex flex-col h-[calc(100vh-64px)]'>

      <Toaster position="top-right" />
      {/* Header Bar */}
      <div className='bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-white'>
          {t('Device Simulator')}
        </h1>
        <div className="flex gap-2">
          {/* Live Session Button - Always visible */}
          <button
            onClick={handleStartLiveSession}
            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v4a1 1 0 11-2 0V7zm1-5a1 1 0 100 2 1 1 0 000-2z'
                clipRule='evenodd'
              />
            </svg>
            {devsim('Live Session')}
          </button>
          
          {/* Session-dependent buttons */}
          {!sessionId ? (
            <button
              onClick={handleStartSession}
              className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2'
              disabled={loading || !selectedDevice || !selectedDeviceRoute}
            >
              {loading ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  {devsim('Starting')}
                </>
              ) : (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                      clipRule='evenodd'
                    />
                  </svg>
                  {devsim('Start Session')}
                </>
              )}
            </button>
          ) : markers.length > 1 ? (
            <button
              onClick={handleEndSession}
              className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2'
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  {devsim('Ending')}
                </>
              ) : (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z'
                      clipRule='evenodd'
                    />
                  </svg>
                  {devsim('End Session')}
                </>
              )}
            </button>
          ) : (  
            <button
              className='bg-gray-600 text-white px-4 py-2 rounded-md cursor-not-allowed flex items-center gap-2'
              disabled={true}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z'
                  clipRule='evenodd'
                />
              </svg>
              Add Location Waypoints
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-gray-900 overflow-auto' style={{ height: 'calc(100vh - 132px)' }}>
{/* Left Panel - Session Info */}
<div className='lg:col-span-1 flex flex-col overflow-auto'>
  {sessionId ? (
    <div className='bg-gray-800 border border-gray-700 rounded-md shadow-md flex flex-col h-full'>
      <div className='p-4 border-b border-gray-700'>
        <h3 className='font-semibold text-green-400 text-lg'>
          {devsim('Active Session')}
        </h3>
      </div>
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='space-y-4'>
          {/* Device Information */}
          {selectedDevice && (
            <div className='mb-4 bg-gray-900 rounded-md p-3 border border-gray-700'>
              <h4 className='text-white text-sm font-medium mb-2'>
                Device Information
              </h4>
              <div className='space-y-2'>
                <div>
                  <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                    Device
                  </p>
                  <p className='text-blue-300 text-xs'>
                    {getDeviceDisplayName(selectedDevice)}
                  </p>
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                    Status
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedDevice.status === 'active'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-red-900 text-red-300'
                    }`}
                  >
                    {selectedDevice.status}
                  </span>
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                    Operator
                  </p>
                  <p className='text-purple-300 text-xs'>
                    {getEmployeeDisplayName(selectedDevice.employee)}
                  </p>
                </div>
              </div>
            </div>
          )}
          {/*device route information */}
          {selectedDeviceRoute && sessionId && route && !routesLoading &&(
            <div className='mb-4 bg-gray-900 rounded-md p-3 border border-gray-700'>
              <h4 className='text-white text-sm font-medium mb-2'>
                Route Information
              </h4>
              <div className='space-y-2'>
                <div>
                  <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                    Route Name
                  </p>
                  <p className='text-indigo-300 text-xs'>
                    {selectedDeviceRoute.route.route_name}
                  </p>
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                    Center Coordinates
                  </p>
                  <p className='text-gray-300 text-xs font-mono'>
                    {route.center_latitude.slice(0, 7)}, {route.center_longitude.slice(0, 7)}
                  </p>
                </div>
              </div>
            </div>
          )}          

          <div>
            <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
              Session ID
            </p>
            <p className='font-mono bg-gray-900 px-2 py-1 rounded text-green-300 text-xs overflow-hidden overflow-ellipsis'>
              {sessionId}
            </p>
          </div>

          {sessionStartTime && (
            <div>
              <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
                Started
              </p>
              <p className='bg-gray-900 px-2 py-1 rounded text-blue-300 text-xs'>
                {formatTime(sessionStartTime)}
              </p>
            </div>
          )}

          <div>
            <p className='text-xs uppercase tracking-wider text-gray-500 mb-1'>
              Points
            </p>
            <p className='bg-gray-900 px-2 py-1 rounded text-yellow-300 text-xs'>
              {markers.length}
            </p>
          </div>


          <div className='pt-3'>
            <h4 className='text-sm font-semibold text-white mb-2'>
              Instructions
            </h4>
            <ul className='text-sm text-gray-400 space-y-2'>
              <li className='flex items-start gap-2'>
                <div className='mt-1 h-2 w-2 rounded-full bg-green-500 flex-shrink-0'></div>
                <span>Click on map to add starting point</span>
              </li>
              <li className='flex items-start gap-2'>
                <div className='mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0'></div>
                <span>Continue adding waypoints as needed</span>
              </li>
              <li className='flex items-start gap-2'>
                <div className='mt-1 h-2 w-2 rounded-full bg-red-500 flex-shrink-0'></div>
                <span>Last point marks the destination</span>
              </li>
              <li className='flex items-start gap-2'>
                <div className='mt-1 h-2 w-2 rounded-full bg-yellow-500 flex-shrink-0'></div>
                <span>Click a marker to edit its timestamp or remove it</span>
              </li>
              <li className='flex items-start gap-2'>
                <div className='mt-1 h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0'></div>
                <span>Or select a route to load predefined waypoints</span>
              </li>
            </ul>
          </div>

          {/* Clear All Waypoints Button */}
          {markers.length > 0 && (
            <button
              onClick={handleClearAllWaypoints}
              className='w-full mt-2 bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-md transition-colors text-sm flex items-center justify-center gap-2'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4'
                fill='none'
                viewBox='0 0 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
              Clear All Waypoints
            </button>
          )}

          {/* Marker Coordinates List */}
          {markers.length > 0 && (
            <div className='pt-3 border-t border-gray-700'>
              <h4 className='text-sm font-semibold text-white mb-2'>
                Waypoints
              </h4>
              <div className='max-h-48 overflow-y-auto pr-2'>
                {markers.map((marker, index) => (
                  <div
                    key={`coord-${index}`}
                    className='text-xs mb-2 p-2 rounded bg-gray-900'
                  >
                    <div className='flex items-center justify-between mb-1'>
                      <div className='flex items-center'>
                        <div
                          className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${
                            index === 0
                              ? 'bg-green-500'
                              : index === markers.length - 1
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                          }`}
                        ></div>
                        <span className='text-gray-400 mr-1'>
                          {index === 0
                            ? 'Start:'
                            : index === markers.length - 1
                            ? 'End:'
                            : `Point ${index}:`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveMarker(index)}
                        className='text-red-400 hover:text-red-300 p-1'
                        title='Remove waypoint'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                    </div>
                    <div className='font-mono mb-1.5'>
                      {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
                    </div>
                    
                    {/* Timestamp editor in left panel */}
                    <div className='mt-1 flex flex-col'>
                      <label className='text-gray-500 text-xs mb-1'>Timestamp:</label>
                      <input
                        type='datetime-local'
                        value={new Date(marker.timestamp).toISOString().slice(0, 16)}
                        onChange={(e) => {
                          // Get the input value (YYYY-MM-DDTHH:MM format)
                          const tempDateTime = e.target.value;
                          
                          // Convert to a proper ISO string while preserving the time as entered
                          // Add "Z" to make it a complete ISO string (indicating UTC)
                          const isoString = new Date(tempDateTime + ":00.000Z").toISOString();
                          
                          handleUpdateMarkerTimestamp(index, isoString);
                        }}
                        className='bg-gray-800 border border-gray-700 text-gray-300 rounded-sm text-xs px-1 py-0.5 w-full mb-2'
                      />
                      
                      {/* Save button at the bottom of each waypoint card */}
                      <button
                        onClick={() => {
                          // Visual confirmation that timestamp was saved
                          const button = document.activeElement as HTMLElement;
                          const originalText = button.textContent;
                          button.textContent = '✓ Saved';
                          button.classList.add('bg-green-600');
                          setTimeout(() => {
                            button.textContent = originalText;
                            button.classList.remove('bg-green-600');
                          }, 1000);
                        }}  
                        className='bg-green-700 hover:bg-blue-700 text-white px-2 py-1 text-xs rounded-sm transition-colors w-full mt-1'
                      >
                        Save Timestamp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className='bg-gray-800 border border-gray-700 rounded-md shadow-md flex flex-col h-full'>
      <div className='p-4 border-b border-gray-700'>
        <h3 className='font-semibold text-blue-400 text-lg'>
          {devsim('Select a Device')}
        </h3>
      </div>
      <div className='flex-1 overflow-y-auto p-4'>
        {/* Device Selection Dropdown */}
        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-400 mb-2'>
            Device
          </label>
          <div className='relative'>
            <button
              type='button'
              className='relative w-full bg-gray-900 border border-gray-700 rounded-md pl-3 pr-10 py-2 text-left cursor-default text-white'
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className='block truncate'>
                {selectedDevice
                  ? getDeviceDisplayName(selectedDevice)
                  : 'Select a device...'}
              </span>
              <span className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                <svg
                  className='h-5 w-5 text-gray-400'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </span>
            </button>

            {/* Dropdown Panel */}
            {isDropdownOpen && (
              <div className='absolute z-10 mt-1 w-full bg-gray-900 shadow-lg rounded-md py-1 max-h-60 overflow-auto'>
                {/* Search input */}
                <div className="px-3 py-2 sticky top-0 bg-gray-900 border-b border-gray-700 z-10">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search devices..."
                      value={deviceSearchQuery}
                      onChange={(e) => setDeviceSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {devicesLoading ? (
                  <div className='px-3 py-2 text-sm text-gray-400 flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Loading devices...
                  </div>
                ) : filteredDevices.length === 0 ? (
                  <div className='px-3 py-2 text-sm text-gray-400'>
                    No devices found
                  </div>
                ) : (
                  filteredDevices.map((device) => (
                    <button
                      key={device.device_id}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 ${
                        selectedDevice?.device_id === device.device_id
                          ? 'bg-gray-800 text-blue-400'
                          : 'text-white'
                      }`}
                      onClick={() => {
                        setSelectedDevice(device)
                        setIsDropdownOpen(false)
                        setSelectedDeviceRoute(null) 
                        setRoute(null)
                        fetchDeviceRoutes(device.device_id)
                        setDeviceSearchQuery('') // Reset search query
                      }}
                    >
                      <div className='flex flex-col'>
                        <span className='font-medium'>
                          {getDeviceDisplayName(device)}
                        </span>
                        <span className='text-xs text-gray-400'>
                          Operator:{' '}
                          {getEmployeeDisplayName(device.employee)}
                        </span>
                        <span
                          className={`text-xs mt-1 inline-flex items-center ${
                            device.status === 'active'
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full mr-1 ${
                              device.status === 'active'
                                ? 'bg-green-400'
                                : 'bg-red-400'
                            }`}
                          ></span>
                          {device.status}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Route Selection UI - Displayed after device selection */}
            {selectedDevice && !sessionId && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Route
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="relative w-full bg-gray-900 border border-gray-700 rounded-md pl-3 pr-10 py-2 text-left cursor-default text-white flex items-center"
                  onClick={() => setIsRouteDropdownOpen(!isRouteDropdownOpen)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="block truncate">
                    {selectedDeviceRoute ? `${selectedDeviceRoute.route.route_name} (${selectedDeviceRoute.day_assigned.slice(0, 3).toUpperCase()})`: 'Select a route...'}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>

                {/* Route Dropdown Panel */}
                {isRouteDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-900 shadow-lg rounded-md py-1 max-h-60 overflow-auto">
                    {deviceRoutesLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-400 flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading routes...
                      </div>
                    ) : deviceRoutes.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-400">
                        No routes assigned to this device
                      </div>
                    ) : (
                      deviceRoutes.map((deviceRoute) => (
                        <button
                          key={deviceRoute.device_route_id}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 ${
                            selectedDeviceRoute?.device_route_id === deviceRoute.device_route_id
                              ? 'bg-gray-800 text-blue-400'
                              : 'text-white'
                          }`}
                          onClick={() => {
                            setSelectedDeviceRoute(deviceRoute)
                            setIsRouteDropdownOpen(false);
                            fetchRouteCoordinates(deviceRoute.route.route_id);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{deviceRoute.route.route_name}</span>
                            <span className="text-xs text-gray-400">
                              Day: {deviceRoute.day_assigned}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
          
        </div>

        <div className='flex flex-col items-center justify-center text-center pt-4'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-16 w-16 text-gray-600 mb-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
            />
          </svg>
          <h3 className='text-lg text-gray-300 font-medium'>
            {devsim('Device Simulator')}
                  </h3>
                  <p className='text-gray-500 mt-2 text-sm'>
                    Select a device and start a session to create a route
                  </p>
                </div>
              </div>
              
            </div>
            
          )}
        </div>

        {/* Right Panel - Map */}
        <div className='lg:col-span-3 bg-gray-800 border border-gray-700 rounded-md shadow-md overflow-hidden' style={{ height: '100%' }}>
        <Map
          sessionActive={!!sessionId}
          onAddMarker={handleAddMarker}
          onRemoveMarker={handleRemoveMarker}
          onUpdateMarkerTimestamp={handleUpdateMarkerTimestamp}
          markers={markers}
          onClearMarkers={handleClearAllWaypoints}
          routeCoordinates={routeCoordinates} 
          selectedRoute={route}
          collectionPoints={collectionPoints}
          sessionId={sessionId}
          selectedDevice={selectedDevice}
          isTimeStampUpdate={isTimestampUpdate}
          setIsTimeStampUpdate={setIsTimeStampUpdate}
        />
        </div>
      </div>
    </div>
  )
}

export default DeviceSimulatorMap
