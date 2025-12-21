'use client'

import RoutePage from '@/components/route/RoutePage'
import { useParams } from 'next/navigation'

const RouteID = () => {
  const params = useParams()
  console.log('Params:', params) // Debugging

  if (!params?.route_id) return <p>Invalid route</p>

  return (
    <div>
      <RoutePage route_id={params.route_id as string} />
    </div>
  )
}

export default RouteID
