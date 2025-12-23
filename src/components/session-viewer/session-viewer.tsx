'use client'
import React, { JSX, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { Device } from '@/types/device'
import axios from 'axios'
import DeviceCombobox from './subcomponents/device-combobox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DeviceRoute } from '@/types/device-route'
import toast from 'react-hot-toast'
import { DeviceLocation } from '@/types/device-location'

// Define a type for the session data
interface DeviceSession {
  session_id: string;
  start: string;
  end: string;
  device_locations?: any[]; // Optional if you want to use this later
}
interface GroupedSessions {
  [monthYear: string]: {
    [weekNum: string]: DeviceSession[];
  };
}


// Dynamically import the map component with SSR disabled
const Map = dynamic(
  () => import('./client-side-map'),
  { ssr: false }
)
        //TODO: problem on filtering 
const SessionViewer = (): JSX.Element => {
  const t = useTranslations('Layout')
  const devsim = useTranslations('Session Viewer')
  const [devices, setDevices] = useState<Device[]>([])
  const [devicesLoading, setDevicesLoading] = useState(false)
  const [viewingSession, setViewingSession] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [deviceRoutes, setDeviceRoutes] = useState<DeviceRoute[]>([])
  const [deviceRoutesLoading, setDeviceRoutesLoading] = useState(false)
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>("all");


  const [selectedDate, setSelectedDate] = useState<string>("");
  const [deviceSelectionCollapsed, setDeviceSelectionCollapsed] = useState(false);
  // New state for sessions
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState<DeviceSession | null>(null)
  const [sessionDetailModalOpen, setSessionDetailModalOpen] = useState(false);

  // State for device info modal
  const [deviceInfoModalOpen, setDeviceInfoModalOpen] = useState(false)
  const [deviceLocations, setDeviceLocations] = useState<DeviceLocation[]>([])
  const [deviceLocationsLoading, setDeviceLocationsLoading] = useState(false)



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

  useEffect(() => {
    if (selectedSession) {
      fetchDeviceLocationsBySessionId(selectedSession.session_id);
    }
  }, [selectedSession]);

  const clearSelectedSession = () => {
    setSelectedSession(null);
    setViewingSession(false);
    setDeviceLocations([]);
  };

  const resetFilters = () => {
    setSelectedRouteFilter("all");
    setSelectedDate("");
    if (selectedDevice) {
      fetchDeviceSessions(selectedDevice.device_id);
    }
  };


  const fetchDeviceLocationsBySessionId = async (sessionId: string) => {
    try {
      setDeviceLocationsLoading(true)
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-locations/session/${sessionId}`
      const response = await axios.get(apiUrl)
     
      if (response.data.success && response.data.data) {
        console.log(`Device Locations${response.data.data}`)
        setDeviceLocations(response.data.data)
      } else {
        setDeviceLocations([])
      }
    } catch (error) {
      console.error('Error fetching device locations:', error)
      setDeviceLocations([])
      toast.error('Failed to load device locations for this session', {
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#FFF',
          border: '1px solid #374151',
          borderRadius: '6px',
        },
      })
    } finally {
      setDeviceLocationsLoading(false)
    }
  }


  const fetchSessionsByRouteAndDate = async (routeId: string, date: string) => {
    try {
      setSessionsLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-sessions/filter/by-route-and-date?routeId=${routeId}&date=${date}&deviceId=${selectedDevice?.device_id}`;
      const response = await axios.get(apiUrl);
  
      if (response.data.success && response.data.data) {
        setDeviceSessions(response.data.data);
        setSelectedSession(null);
      } else {
        setDeviceSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions by route and date:', error);
      setDeviceSessions([]);
      toast.error('Failed to load sessions for this route and date', {
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#FFF',
          border: '1px solid #374151',
          borderRadius: '6px',
        },
      });
    } finally {
      setSessionsLoading(false);
    }
  };
  
  const fetchSessionsByDate = async (date: string) => {
    try {
      setSessionsLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-sessions/filter/by-date?date=${date}&deviceId=${selectedDevice?.device_id}`;
      const response = await axios.get(apiUrl);
  
      if (response.data.success && response.data.data) {
        setDeviceSessions(response.data.data);
        setSelectedSession(null);
      } else {
        setDeviceSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions by date:', error);
      setDeviceSessions([]);
      toast.error('Failed to load sessions for this date', {
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#FFF',
          border: '1px solid #374151',
          borderRadius: '6px',
        },
      });
    } finally {
      setSessionsLoading(false);
    }
  };


  const fetchSessionsByRoute = async (routeId: string) => {
    try {
      setSessionsLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-sessions/route/${routeId}?deviceId=${selectedDevice?.device_id}`;
      const response = await axios.get(apiUrl);

      if (response.data.success && response.data.data) {
        setDeviceSessions(response.data.data);
        setSelectedSession(null);
      } else {
        setDeviceSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions by route:', error);
      setDeviceSessions([]);
      toast.error('Failed to load sessions for this route', {
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#FFF',
          border: '1px solid #374151',
          borderRadius: '6px',
        },
      });
    } finally {
      setSessionsLoading(false);
    }
  };


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

  const fetchDeviceSessions = async (deviceId: string) => {
    try {
      setSessionsLoading(true)
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/device-sessions/device/${deviceId}`
      const response = await axios.get(apiUrl)

      if (response.data.success && response.data.data) {
        setDeviceSessions(response.data.data)
        setSelectedSession(null) // Reset selected session
      } else {
        setDeviceSessions([])
      }
    } catch (error) {
      console.error('Error fetching device sessions:', error)
      setDeviceSessions([])
    } finally {
      setSessionsLoading(false)
    }
  }

  const handleDeviceSelect = (device: Device | null) => {
    setSelectedDevice(device);
    setSelectedSession(null); // Reset selected session when device changes
    setSelectedRouteFilter("all");
    
    if (device) {
      fetchDeviceSessions(device.device_id);
      fetchDeviceRoutes(device.device_id);
    } else {
      setDeviceSessions([]);
      setDeviceRoutes([]);
    }
  };
  
  
  const handleSessionSelect = (session: DeviceSession) => {
    setSelectedSession(session)
    setViewingSession(true)
  }
  

  const getEmployeeDisplayName = (employee: Device['employee']) => {
    return `${employee.first_name} ${employee.last_name}`
  }
  

  

  const organizeSessionsByMonthAndWeek = (sessions: DeviceSession[]): GroupedSessions => {
    // Sort sessions by start date (newest first)
    const sortedSessions = [...sessions].sort((a, b) => {
      return new Date(b.start).getTime() - new Date(a.start).getTime();
    });
    
    const grouped: GroupedSessions = {};
    
    sortedSessions.forEach(session => {
      const date = new Date(session.start);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const weekNum = getWeekOfMonth(date).toString();
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = {};
      }
      
      if (!grouped[monthYear][weekNum]) {
        grouped[monthYear][weekNum] = [];
      }
      
      grouped[monthYear][weekNum].push(session);
    });
    
    return grouped;
  }

  // Helper to get week of month
  const getWeekOfMonth = (date: Date): number => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return Math.ceil((date.getDate() + firstDay) / 7);
  }

  const openSessionDetail = (session: DeviceSession) => {
    setSelectedSession(session);
    setSessionDetailModalOpen(true);
  }


  return (
    <div className='flex flex-col h-[calc(100vh-64px)]'>
      {/* Header Bar */}
      <div className='bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-white'>
          {t('Session Viewer')}
        </h1>
      </div>
      
      {/* Main Content */}
      <div className='flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-gray-900 overflow-hidden'>
        {/* Left Panel - Device Selection */}
        <div className='lg:col-span-1 bg-gray-800 border border-gray-700 rounded-md shadow-md flex flex-col overflow-hidden relative'>
          <div className='p-4 border-b border-gray-700'>
            <h3 className='font-semibold text-blue-400 text-lg'>
              {devsim('Device Selection')}
            </h3>
          </div>
          
          {/* Device Selection Content */}
          <div className='px-4 py-3 flex-1 overflow-y-auto'>
            <DeviceCombobox 
              devices={devices} 
              devicesLoading={devicesLoading}
              onSelectDevice={handleDeviceSelect}
              selectedDevice={selectedDevice}
            />
            
            {/* Device Info Summary */}
            {selectedDevice && (
              <div className="mt-4 p-3 bg-gray-900/50 rounded-md border border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedDevice.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <p className="text-sm font-medium text-blue-400 truncate">
                    {selectedDevice.device_name}
                  </p>
                </div>
                {selectedDevice.employee && (
                  <p className="text-xs text-gray-400 ml-4 mb-2">
                    Assigned to: {selectedDevice.employee.first_name} {selectedDevice.employee.last_name}
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => setDeviceInfoModalOpen(true)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1 rounded-md transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}
            
            {/* Filtering Section */}
            {selectedDevice && (
              <div className="mt-4 space-y-4">
                {/* Session Count Info */}
                <div className="flex justify-between items-center px-3 py-2 bg-gray-900/50 rounded-md border border-gray-700">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className='text-blue-400 text-sm font-medium'>Sessions</h4>
                  </div>
                  <span className='text-xs text-gray-400'>
                    {deviceSessions.length} session{deviceSessions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Filter Controls */}
                <div className='bg-gray-900/50 rounded-md p-3 border border-gray-700'>
                  <h5 className="text-xs font-medium text-blue-400 mb-2">Filter Sessions</h5>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Date</label>
                      <div className="flex">
                        <input 
                          type="date" 
                          className="rounded bg-gray-800 border border-gray-700 text-gray-200 text-xs p-1 w-full"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Route Filter */}
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Route</label>
                      <select 
                        className="w-full rounded bg-gray-800 border border-gray-700 text-gray-200 text-xs p-1"
                        value={selectedRouteFilter}
                        onChange={(e) => setSelectedRouteFilter(e.target.value)}
                      >
                        <option value="all">All Routes</option>
                        {deviceRoutes.map(deviceRoute => (
                          <option key={deviceRoute.route.route_id} value={deviceRoute.route.route_id}>
                            {deviceRoute.route.route_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Filter Buttons */}
                    <div className="flex space-x-2">
                      <button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
                        onClick={() => {
                          if (selectedDate && selectedRouteFilter !== "all") {
                            fetchSessionsByRouteAndDate(selectedRouteFilter, selectedDate);
                          } else if (selectedDate) {
                            fetchSessionsByDate(selectedDate);
                          } else if (selectedRouteFilter !== "all") {
                            fetchSessionsByRoute(selectedRouteFilter);
                          } else if (selectedDevice) {
                            fetchDeviceSessions(selectedDevice.device_id);
                          }
                        }}
                      >
                        Apply Filters
                      </button>
                      <button 
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded transition-colors"
                        onClick={resetFilters}
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            

          </div>
          
            {/* Add Session Toggle Button at bottom of left panel */}
            {selectedDevice && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setDeviceSelectionCollapsed(!deviceSelectionCollapsed)}
                  className="bg-gray-900 hover:bg-gray-800 text-blue-400 border border-gray-700 px-3 py-2 rounded-md flex items-center space-x-2 transition-colors"
                >
                  <span className="text-sm">
                    {deviceSelectionCollapsed ? "Show Sessions" : "Hide Sessions"}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${deviceSelectionCollapsed ? '' : 'transform rotate-180'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
        </div>
        
        {/* Map Panel - Takes up all remaining space */}
        <div className="lg:col-span-3 bg-gray-800 border border-gray-700 rounded-md shadow-md overflow-hidden" 
            style={{ height: '100%', position: 'relative', zIndex: 0 }}>
          {deviceLocationsLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <svg className='animate-spin h-10 w-10 text-blue-500 mb-2' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                <p className="text-sm text-white">Loading location data...</p>
              </div>
            </div>
          )}
          <Map deviceLocations={deviceLocations} />
        </div>

        {/* Floating Sessions List Panel */}
        {selectedDevice && !deviceSelectionCollapsed && (
          <div 
            className="lg:block absolute bg-gray-800 border border-gray-700 rounded-md shadow-md flex flex-col overflow-hidden transition-all duration-300"
            style={{ 
              left: 'calc(25% + 2.5rem)',
              top: '4.5rem',
              height: 'calc(100% - 5.5rem)',
              width: '25%',
              zIndex: 30,
            }}
          >
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-blue-400 text-lg">
                {devsim('Sessions')}
              </h3>
              <button
                onClick={() => setDeviceSelectionCollapsed(true)}
                className="text-gray-400 hover:text-blue-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              
            </div>
            {selectedSession && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={clearSelectedSession}
                  className='text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-blue-400 px-2 py-1 rounded-md transition-colors flex items-center'
                >
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Release Selection
                </button>
              </div>
            )}
            <div className="px-4 py-3 flex-1 overflow-y-auto" style={{ height: 'calc(100% - 4rem)' }}>
              {/* Today's sessions section */}
              <div className='bg-gray-900 rounded-md p-3 border border-gray-700 mb-4'>
                <h5 className="text-xs font-medium text-blue-400 mb-2">Today's Sessions</h5>
                {sessionsLoading ? (
                  <div className='flex items-center justify-center py-4'>
                    <svg className='animate-spin h-5 w-5 text-blue-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                  </div>
                ) : (
                  <>
                    {deviceSessions.filter(session => {
                      const sessionDate = new Date(session.start).toLocaleDateString();
                      const today = new Date().toLocaleDateString();
                      return sessionDate === today;
                    }).length > 0 ? (
                      <div className='space-y-2'>
                        {deviceSessions.filter(session => {
                          const sessionDate = new Date(session.start).toLocaleDateString();
                          const today = new Date().toLocaleDateString();
                          return sessionDate === today;
                        }).map((session) => (
                          <div key={session.session_id} className="group mb-1">
                            <button
                              onClick={() => handleSessionSelect(session)}
                              className={`w-full block text-left p-3 rounded-t-md border-t border-l border-r transition-colors ${
                                selectedSession?.session_id === session.session_id
                                  ? 'bg-blue-900/30 border-blue-500'
                                  : 'border-gray-700 hover:bg-gray-800'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-blue-400">
                                  {new Date(session.start).toLocaleDateString('en-US', { weekday: 'long' })}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(session.start).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(session.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  {' - '}
                                  {new Date(session.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </button>
                            <button 
                              onClick={() => openSessionDetail(session)}
                              className={`w-full text-center py-1 text-xs rounded-b-md border-b border-l border-r transition-colors ${
                                selectedSession?.session_id === session.session_id 
                                  ? 'bg-blue-900/20 border-blue-500 text-blue-400'
                                  : 'border-gray-700 bg-gray-900/30 text-gray-500 hover:text-gray-300'
                              }`}
                            >
                              View Details
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <p className='text-gray-400 text-sm'>No sessions today</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* All available sessions */}
              <div className='bg-gray-900 rounded-md p-3 border border-gray-700'>
                <h5 className="text-xs font-medium text-blue-400 mb-2">All Sessions</h5>
                {sessionsLoading ? (
                  <div className='flex items-center justify-center py-8'>
                    <svg className='animate-spin h-6 w-6 text-blue-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                  </div>
                ) : deviceSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <svg className="h-10 w-10 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className='text-gray-400 text-sm'>No sessions found for this device</p>
                  </div>
                ) : (
                  <div className='space-y-4 overflow-y-auto pr-1 custom-scrollbar' style={{ maxHeight: 'calc(100% - 2rem)' }}>
                    {Object.entries(organizeSessionsByMonthAndWeek(deviceSessions)).map(([monthYear, weeks]) => (
                      <div key={monthYear} className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-300 px-1 sticky top-0 bg-gray-900 py-1 z-10">{monthYear}</h5>
                        
                        {Object.entries(weeks)
                          // Sort weeks in descending order (newest first)
                          .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                          .map(([weekNum, sessions]) => (
                            <div key={`${monthYear}-${weekNum}`} className="space-y-1 mb-3">
                              <h6 className="text-xs text-gray-500 px-1">Week {weekNum}</h6>
                              
                              {sessions.map((session) => (
                                <div key={session.session_id} className="group mb-1">
                                  <button
                                    onClick={() => handleSessionSelect(session)}
                                    className={`w-full block text-left p-3 rounded-t-md border-t border-l border-r transition-colors ${
                                      selectedSession?.session_id === session.session_id
                                        ? 'bg-blue-900/30 border-blue-500'
                                        : 'border-gray-700 hover:bg-gray-800'
                                    }`}
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium text-blue-400">
                                        {new Date(session.start).toLocaleDateString('en-US', { weekday: 'long' })}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {new Date(session.start).toLocaleDateString()}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {new Date(session.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        {' - '}
                                        {new Date(session.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </span>
                                    </div>
                                  </button>
                                  <button 
                                    onClick={() => openSessionDetail(session)}
                                    className={`w-full text-center py-1 text-xs rounded-b-md border-b border-l border-r transition-colors ${
                                      selectedSession?.session_id === session.session_id 
                                        ? 'bg-blue-900/20 border-blue-500 text-blue-400'
                                        : 'border-gray-700 bg-gray-900/30 text-gray-500 hover:text-gray-300'
                                    }`}
                                  >
                                    View Details
                                  </button>
                                </div>
                              ))}
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Device Information Modal */}
        <Dialog open={deviceInfoModalOpen} onOpenChange={setDeviceInfoModalOpen}>
          <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-md" style={{ position: 'fixed', zIndex: 9999 }}>
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-400">
                Device Information
              </DialogTitle>
            </DialogHeader>
            
            {selectedDevice && (
              <div className="space-y-4">
                {/* Device Info Section */}
                <div className="space-y-3 pb-3 border-b border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300">Device Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Name</p>
                      <p className="text-sm text-blue-300">{selectedDevice.device_name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Status</p>
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
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Device ID</p>
                      <p className="text-sm text-blue-300 font-mono">{selectedDevice.device_id}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Vehicle Plate</p>
                      <p className="text-sm text-blue-300">{selectedDevice.vehicle_plate_num}</p>
                    </div>
                  </div>
                </div>
                
                {/* Employee Info Section */}
                {selectedDevice.employee && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-300">Assigned Employee</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Name</p>
                        <p className="text-sm text-purple-300">{getEmployeeDisplayName(selectedDevice.employee)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Email</p>
                        <p className="text-sm text-purple-300">{selectedDevice.employee.email}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Contact</p>
                        <p className="text-sm text-purple-300">{selectedDevice.employee.contact_number}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Address</p>
                        <p className="text-sm text-purple-300">{selectedDevice.employee.address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
    
        {/* Session Detail Modal */}
        <Dialog open={sessionDetailModalOpen} onOpenChange={setSessionDetailModalOpen}>
          <DialogContent className="bg-gray-900 border border-gray-700 text-white max-w-md" style={{ position: 'fixed', zIndex: 9999 }}>
            <DialogHeader>
              <DialogTitle className="text-xl text-blue-400">
                Session Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedSession && (
              <div className="space-y-4">
                <div className="space-y-3 pb-3 border-b border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300">Time Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Day</p>
                      <p className="text-sm text-blue-300">{new Date(selectedSession.start).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Date</p>
                      <p className="text-sm text-blue-300">{new Date(selectedSession.start).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Start Time</p>
                      <p className="text-sm text-blue-300">{new Date(selectedSession.start).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">End Time</p>
                      <p className="text-sm text-blue-300">{new Date(selectedSession.end).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-300">Session Information</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Session ID</p>
                      <p className="text-sm text-purple-300 font-mono">{selectedSession.session_id}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Duration</p>
                      <p className="text-sm text-purple-300">
                        {(() => {
                          const start = new Date(selectedSession.start);
                          const end = new Date(selectedSession.end);
                          const diffMs = end.getTime() - start.getTime();
                          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                          const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                          return `${diffHrs} hr${diffHrs !== 1 ? 's' : ''} ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      
    </div>
  )
}

export default SessionViewer