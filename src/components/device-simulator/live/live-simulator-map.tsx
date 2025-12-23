'use client'
import React, { JSX, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { MapIcon, Loader2 } from 'lucide-react'
import { Device } from '@/types/device'
import toast from 'react-hot-toast'
import { DeviceRoute } from '@/types/device-route'
import { Route } from '@/types/route'
import DeviceCombobox from './subcomponents/DeviceCombobox'
import RouteCombobox from './subcomponents/RouteCombobox'
import { CollectionPoints } from '@/types/collection-points'
import LoadingOverlay from './subcomponents/LoadingOverelay'

// Dynamically import the map component with SSR disabled
const Map = dynamic(
  () => import('./live-clientside-map'),
  { ssr: false }
)

const LiveSimulatorMap = (): JSX.Element => {
  const devsim = useTranslations('Device Simulator')
  const [devices, setDevices] = useState<Device[]>([])
  const [deviceRoutes, setDeviceRoutes] = useState<DeviceRoute[]>([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [selectedDeviceRoute, setSelectedDeviceRoute] = useState<DeviceRoute | null>(null)
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{
    route_coordinates_id: string;
    latitude: string;
    longitude: string;
    sequence: number;
  }>>([]);
  const [collectionPoints, setCollectionPoints] = useState<Array<CollectionPoints>>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [routeCoordinatesLoading, setRouteCoordinatesLoading] = useState(false);
  const [collectionPointsLoading, setCollectionPointsLoading] = useState(false);
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [deviceRoutesLoading, setDeviceRoutesLoading] = useState(false)
  const [sessionStarting, setSessionStarting] = useState(false)
  const [localDateTime, setLocalDateTime] = useState<string>(() => {
    const now = new Date();
    // Adjust to JST (UTC+9)
    now.setHours(now.getHours() + 9);
    return now.toISOString().slice(0, 16);
  });
  const [sessionEnding, setSessionEnding] = useState(false);
  // Compute loading message based on what's currently loading
  const getLoadingMessage = () => {
    if (routeCoordinatesLoading && collectionPointsLoading) {
      return "Fetching route coordinates and collection points...";
    } else if (routeCoordinatesLoading) {
      return "Fetching route coordinates...";
    } else if (collectionPointsLoading) {
      return "Fetching collection points...";
    }
    return "";
  };

  useEffect(() => {
    if (isMapFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMapFullScreen]);

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
        toast.error('Failed to load devices', {
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#FFF',
            border: '1px solid #374151',
            borderRadius: '6px',
          },
        })
      } finally {
        setDevicesLoading(false)
      }
    }

    fetchDevices()
  }, [])

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceRoutes(selectedDevice.device_id)
    } else {
      setDeviceRoutes([])
      setSelectedDeviceRoute(null)
    }
  }, [selectedDevice])

  useEffect(() => {
    if (selectedDeviceRoute && selectedDeviceRoute?.route.route_id) {
      fetchRouteCoordinates(selectedDeviceRoute?.route.route_id)
      fetchCollectionPoints(selectedDeviceRoute?.route.route_id)
    } else {
      setRouteCoordinates([])
      setCollectionPoints([])
    }
  }, [selectedDeviceRoute])


  const fetchDeviceRoutes = async (deviceId: string) => {
    if (!deviceId) return
    
    try {
      setDeviceRoutesLoading(true)
      setSelectedDeviceRoute(null) 
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-routes/device/${deviceId}`
      const response = await axios.get(apiUrl)
  
      if (response.data.success && response.data.data) {
        setDeviceRoutes(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching device routes:', error)
      toast.error('Failed to load routes for this device', {
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#FFF',
          border: '1px solid #374151',
          borderRadius: '6px',
        },
      })
    } finally {
      setDeviceRoutesLoading(false)
    }
  }

  const fetchRouteCoordinates = async (routeId: string) => {
    if (!routeId) return;
    
    try {
      setRouteCoordinatesLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/route-coordinates/route/${routeId}`;
      const response = await axios.get(apiUrl);
      
      if (response.data.success && response.data.data) {
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

  const fetchCollectionPoints = async (routeId: string) => {
    if (!routeId) return;
    
    try {
      setCollectionPointsLoading(true);
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
    } finally {
      setCollectionPointsLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!selectedDevice) {
      // Show an alert or notification that a device must be selected
      alert('Please select a device first')
      return
    }
    try {
      setSessionStarting(true)
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-sessions/`
      const response = await axios.post(apiUrl, {
        route_id: selectedDeviceRoute?.route.route_id,
        device_route_id: selectedDeviceRoute?.device_route_id
      })
      console.log('Session started successfully:', response.data)

      if (response.data.success && response.data.data) {
        setSessionId(response.data.data.session_id)
      }
    } catch (error) {
      console.error('Error starting session:', error)
    } finally {
      setSessionStarting(false)
    }
  }

  const handleEndSession = async () => {
    if (!sessionId) {
      return;
    }
  
    try {
      setSessionEnding(true);
  
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-sessions/${sessionId}/end`;
      const response = await axios.put(apiUrl);
      
      if (response.data.success) {
        setSessionId(null);
        toast.success('Session ended successfully', {
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#FFF',
            border: '1px solid #374151',
            borderRadius: '6px',
          },
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session', {
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#FFF',
          border: '1px solid #374151',
          borderRadius: '6px',
        },
      });
    } finally {
      setSessionEnding(false);
    }
  };

  return (
    <div className='flex flex-col h-screen'>
      {/* Header Bar with improved layout and z-index */}
      <div className={`bg-[#1F2937] text-white p-4 shadow-md mx-4 mt-4 rounded-lg relative z-40 transition-all duration-300 ${
        isMapFullScreen ? 'opacity-0 pointer-events-none absolute -top-full ' : 'opacity-100 '
      }`}>
        <div className='flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center'>
          {/* Left side - Title with icon */}
          <div className='flex items-center'>
            <MapIcon size={20} className="mr-2" />
            <h1 className='text-lg font-semibold'>{devsim('Live Simulation')}</h1>
          </div>
          
          {/* Center - Comboboxes */}
          <div className='flex flex-1 flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 md:mx-6 relative z-40'>
            <div className='flex-1'>
              <DeviceCombobox
                devices={devices}
                devicesLoading={devicesLoading}
                onSelectDevice={setSelectedDevice}
                selectedDevice={selectedDevice}
                disabled={!!sessionId}
              />
            </div>
            
            <div className='flex-1'>
              <RouteCombobox
                routes={deviceRoutes}
                routesLoading={deviceRoutesLoading}
                onSelectRoute={setSelectedDeviceRoute}
                selectedRoute={selectedDeviceRoute}
                disabled={!selectedDevice || !!sessionId}
              />
            </div>

            {/* DateTime Picker with disabled styling */}
            <div className='flex-1'>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-sm font-medium ${!!sessionId ? 'text-gray-500' : ''}`}>
                  {devsim('Set Initial Time')}:
                </span>
              </div>
              <input
                type="datetime-local"
                id="initialTime"
                className={`w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-left text-sm transition-all ${
                  !!sessionId 
                    ? 'opacity-60 cursor-not-allowed text-gray-400' 
                    : 'hover:bg-gray-650 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white'
                }`}
                value={localDateTime}
                onChange={(e) => {
                  if (!sessionId) {
                    setLocalDateTime(e.target.value);
                    console.log(`Selected time: ${e.target.value}`);
                  }
                }}
                style={{ height: '38px' }}
                disabled={!!sessionId}
              />
            </div>
          </div>
          
            {/* Right side - Start/End Button */}
            <div>
            {sessionId ? (
                <button 
                onClick={handleEndSession} 
                className='w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={sessionEnding}
                >
                {sessionEnding ? (
                    <>
                    <Loader2 size={16} className='animate-spin mr-2' />
                    {devsim('Ending')}
                    </>
                ) : (
                    devsim('End Session')
                )}
                </button>
            ) : (
                <button 
                onClick={handleStartSession} 
                className='w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={!selectedDevice || !selectedDeviceRoute || sessionStarting || routeCoordinatesLoading || collectionPointsLoading}
                >
                {sessionStarting ? (
                    <>
                    <Loader2 size={16} className='animate-spin mr-2' />
                    {devsim('Loading')}
                    </>
                ) : (
                    devsim('Start Session')
                )}
                </button>
            )}
            </div>
        </div>
      </div>
      
        {/* Map Content - set a lower z-index */}
        <div className='flex-1 overflow-hidden mx-4 mb-4 mt-2 rounded-lg relative z-30'>
        {selectedDeviceRoute && selectedDevice ? (
            <>
            <Map 
            routeCoordinates={routeCoordinates} 
            collectionPoints={collectionPoints}
            sessionId={sessionId}
            selectedDevice={selectedDevice}
            localDateTime={localDateTime}
            setIsFS={setIsMapFullScreen}
            selectedDeviceRoute={selectedDeviceRoute}
            />
            <LoadingOverlay 
                isVisible={routeCoordinatesLoading || collectionPointsLoading} 
                message={getLoadingMessage()} 
            />
            </>
        ) : (
            <div className='h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <div className='text-center'>
                <MapIcon size={48} className='mx-auto text-gray-400 mb-2' />
                <p className='text-gray-500'>
                {devicesLoading || deviceRoutesLoading ? (
                    <span className='flex items-center justify-center'>
                    <Loader2 size={16} className='animate-spin mr-2' />
                    Loading map data...
                    </span>
                ) : (
                    'Select a device and route to view the map'
                )}
                </p>
            </div>
            </div>
        )}
        </div>
    </div>
  )
}

export default LiveSimulatorMap