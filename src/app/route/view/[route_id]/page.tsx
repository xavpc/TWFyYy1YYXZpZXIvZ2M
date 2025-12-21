'use client'

import ViewRoute from '@/components/OSM/ViewRoute'
import { useParams } from 'next/navigation'

const RouteID = () => {
  const params = useParams()
  console.log('Params:', params) // Debugging

  if (!params?.route_id) return <p>Invalid route</p>

  const routeId = params.route_id as string

  // Function to check if the route_id is a valid UUID
  const isUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  if (!isUUID(routeId)) return <p>Invalid route</p>

  return (
    <div>
      <ViewRoute route_id={routeId} route_name={''} />
    </div>
  )
}

export default RouteID
