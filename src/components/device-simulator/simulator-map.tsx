'use client'
import React, { JSX, useState } from 'react'
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
  
  // Format the session start time for display
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString()
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
                
                <div className="pt-4 border-t border-gray-700">
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
                  </ul>
                </div>
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
          <Map sessionActive={!!sessionId} onAddMarker={handleAddMarker} />
        </div>
      </div>
    </div>
  )
}

export default DeviceSimulatorMap