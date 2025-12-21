'use client'

import { useEffect, useState } from 'react'
import { RouteData } from '@/types/routeName' // Import RouteData from your types file

const RoutePage = ({ route_id }: { route_id: string }) => {
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRouteDetails()
    setLoading(false)
  }, [route_id])

  const fetchRouteDetails = async () => {
    setLoading(true) // Start loading

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/route-coordinates/route/${route_id}`
    )
    const data = await response.json()

    console.log('API Response:', data) // Debugging

    // Extract route data similar to how employees were handled
    const routeArray = Array.isArray(data)
      ? data
      : data.routes || data.data || []

    if (!Array.isArray(routeArray) || routeArray.length === 0) {
      console.error('Route data is not an array or is empty:', routeArray)
      setRouteData(null) // Fallback to null
    } else {
      setRouteData(routeArray[0]) // Assuming the first item contains the route details
    }
  }

  if (loading) return <p>Loading route...</p>
  if (error) return <p className='text-red-500'>{error}</p>
  if (!routeData) return <p>No Route made</p>

  return (
    <div>
      <h1>Route Details</h1>
      <p>
        <strong>Route ID:</strong> {routeData.route?.route_id ?? 'N/A'}
      </p>
      <p>
        <strong>Route Name:</strong> {routeData.route?.route_name ?? 'N/A'}
      </p>
      <p>
        <strong>Route Coordinates ID:</strong>{' '}
        {routeData.route_coordinates_id ?? 'N/A'}
      </p>
      <p>
        <strong>Latitude:</strong> {routeData.latitude ?? 'N/A'}
      </p>
      <p>
        <strong>Longitude:</strong> {routeData.longitude ?? 'N/A'}
      </p>
      <p>
        <strong>Sequence:</strong> {routeData.sequence ?? 'N/A'}
      </p>
    </div>
  )
}

export default RoutePage
