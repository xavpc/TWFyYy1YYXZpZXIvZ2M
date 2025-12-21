'use client'

import { useEffect, useState } from 'react'
import { RouteData } from '@/types/routeName' // Import RouteData from your types file

const RoutePage = ({ route_id }: { route_id: string }) => {
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRouteDetails()
  }, [])

  if (loading) return <p>Loading route...</p>
  if (error) return <p className='text-red-500'>{error}</p>
  if (!routeData) return <p>Route not found.</p>

  return (
    <div>
      <h1>Route Details</h1>
      <p>
        <strong>Route ID:</strong> {routeData.route.route_id}
      </p>
      <p>
        <strong>Route Name:</strong> {routeData.route.route_name}
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
