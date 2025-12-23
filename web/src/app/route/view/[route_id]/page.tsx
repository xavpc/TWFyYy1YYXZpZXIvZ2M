'use client'

import ViewRoute from '@/components/OSM/ViewRoute'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl' // Import useTranslations

const RouteID = () => {
  const params = useParams()
  console.log('Params:', params) // Debugging

  const t = useTranslations('Route') // Ensure

  if (!params?.route_id) return <p>{t('Invalid Route')}</p>

  const routeId = params.route_id as string

  // Function to check if the route_id is a valid UUID
  const isUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  if (!isUUID(routeId)) return <p>{t('Invalid Route')}</p>

  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold mb-5'>{t('View Route')}</h1>
      <ViewRoute route_id={routeId} route_name={''} />
    </div>
  )
}

export default RouteID
