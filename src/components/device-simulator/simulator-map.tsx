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
    <div className='p-5'>
      <h1 className='text-2xl font-bold mb-4'>{t('Device Simulator')}</h1>
      <div className='mt-4'>
        <h2 className='text-lg font-bold mb-2'>{devsim('Hello there')}</h2>
        
        {/* Session details display */}
        {sessionId && (
          <div className='mb-4 p-4 bg-gray-800 border border-gray-700 rounded-md shadow-md'>
            <h3 className='font-semibold text-green-400'>{devsim('Active Session')}</h3>
            <div className='mt-2 space-y-2'>
              <p className='text-sm text-gray-300 flex items-center'>
                <span className='font-medium text-gray-400 w-24'>Session ID:</span> 
                <span className='font-mono bg-gray-900 px-2 py-1 rounded text-green-300 text-xs overflow-hidden overflow-ellipsis'>{sessionId}</span>
              </p>
              {sessionStartTime && (
                <p className='text-sm text-gray-300 flex items-center'>
                  <span className='font-medium text-gray-400 w-24'>Started:</span> 
                  <span className='bg-gray-900 px-2 py-1 rounded text-blue-300 text-xs'>{formatTime(sessionStartTime)}</span>
                </p>
              )}
              {markers.length > 0 && (
                <p className='text-sm text-gray-300 flex items-center'>
                  <span className='font-medium text-gray-400 w-24'>Points:</span> 
                  <span className='bg-gray-900 px-2 py-1 rounded text-yellow-300 text-xs'>{markers.length}</span>
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Button and instructions */}
        <div className='mb-4 flex flex-col space-y-2'>
          <button 
            onClick={handleStartSession}
            className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
            disabled={loading || !!sessionId}
          >
            {loading ? devsim('Starting') : sessionId ? devsim('Session Active') : devsim('Start Session')}
          </button>
          
          {sessionId && (
            <p className='text-sm text-gray-500 italic'>
              Click on the map to add points to your route. The first point will be green, intermediate points blue, and the last point red.
            </p>
          )}
        </div>
        
        <Map sessionActive={!!sessionId} onAddMarker={handleAddMarker} />
      </div>
    </div>
  )
}

export default DeviceSimulatorMap