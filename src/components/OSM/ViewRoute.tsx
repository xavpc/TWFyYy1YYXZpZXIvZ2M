import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface OSMMapProps {
  route_id?: string
  route_name: string
}
interface CenterCoordinates {
  latitude: number
  longitude: number
}

import { useTranslations } from 'next-intl' // Import
import { useRouter } from 'next/navigation'

const ViewRoute: React.FC<OSMMapProps> = ({ route_id }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const routesRef = useRef<L.Polyline[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [center, setCenter] = useState<CenterCoordinates>({
    latitude: 10.3157,
    longitude: 123.8854,
  })
  const [noData, setNoData] = useState(false) // Add state for tracking no data
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  const t = useTranslations('Route')
  const dialog = useTranslations('Dialog')

  useEffect(() => {
    const fetchData = async () => {
      await fetchCenterCoordinates()
      await fetchAndDisplayRoute()
    }

    fetchData()
  }, [route_id])

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    try {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      const map = L.map(mapContainerRef.current, {
        center: [center.latitude, center.longitude],
        zoom: 15,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      mapInstanceRef.current = map

      return () => {
        routesRef.current.forEach((route) => route.remove())
        map.remove()
        mapInstanceRef.current = null
      }
    } catch (error) {
      console.error('Error initializing map:', error)
      setError('Failed to initialize map')
    }
  }, [center, route_id])

  const fetchCenterCoordinates = async () => {
    if (!route_id) return

    try {
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      }/routes/${route_id}`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch route details: ${await response.text()}`
        )
      }

      const { data } = await response.json()

      setCenter({
        latitude: parseFloat(data.center_latitude),
        longitude: parseFloat(data.center_longitude),
      })
      console.log(`route data`, data)
      console.log(`centerzzzz: ${center.latitude}, ${center.longitude}`)
    } catch (error) {
      console.error('Error fetching center coordinates:', error)
    }
  }

  const clearRoutes = () => {
    routesRef.current.forEach((route) => route.remove())
    routesRef.current = []
  }

  //^ FETCHES AND DISPLAY ROUTE
  const fetchAndDisplayRoute = async () => {
    if (!route_id || !mapInstanceRef.current) return

    setIsLoading(true)
    setError(null)
    setNoData(false) // Reset no data state

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving/'

    try {
      // Fetch route coordinates
      const response = await fetch(
        `${API_URL}/route-coordinates/route/${route_id}`
      )

      const { data } = await response.json()
      if (!data?.length) {
        setNoData(true) // Indicate no data found
        return
      }

      // Sort by sequence and format for OSRM
      const sortedCoordinates = data.sort(
        (a: any, b: any) => a.sequence - b.sequence
      )
      const waypoints = sortedCoordinates
        .map((coord: any) => `${coord.longitude},${coord.latitude}`)
        .join(';')

      // Fetch optimized route from OSRM
      const osrmResponse = await fetch(
        `${OSRM_BASE_URL}${waypoints}?overview=full&geometries=geojson`
      )
      const osrmData = await osrmResponse.json()

      if (!osrmData.routes?.length)
        throw new Error('OSRM did not return a valid route')

      // Convert OSRM response to Leaflet-compatible coordinates
      const routeCoordinates = osrmData.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      )

      // Add polyline route to the map
      const route = L.polyline(routeCoordinates, {
        color: 'blue',
        weight: 3,
        opacity: 0.7,
      }).addTo(mapInstanceRef.current)
      routesRef.current.push(route)

      // Define marker icon
       // Add markers for each coordinate with sequence number
      sortedCoordinates.forEach(({ latitude, longitude, sequence }) => {
        // Create a custom div icon to show the sequence number above the marker
        const sequenceIcon = L.divIcon({
          html: `<div style="
      background-color: white;
      border: 2px solid blue;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      text-align: center;
      font-weight: bold;
      font-size: 14px;
      line-height: 24px;
      color: black;">
      ${sequence}
    </div>`,
          className: 'sequence-label',
          iconSize: [20, 20],
          iconAnchor: [10, -10], // Position above the marker
        })

        // Create a marker icon
        const markerIcon = L.icon({
          iconUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })

        // Add sequence number as a separate icon
        L.marker([parseFloat(latitude), parseFloat(longitude)], {
          icon: sequenceIcon,
        }).addTo(mapInstanceRef.current)

        // Add actual marker
        L.marker([parseFloat(latitude), parseFloat(longitude)], {
          icon: markerIcon,
        }).addTo(mapInstanceRef.current)
      })
    } catch (error) {
      console.error('Error fetching route:', error)
      setError('Error fetching route')
    } finally {
      setIsLoading(false)
    }
  }

  //^ DELETES ROUTE
  const handleDeleteRoute = async () => {
    if (!route_id) return

    setIsLoading(true)
    setError(null)

    try {
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      }/route-coordinates/route/${route_id}`

      const response = await fetch(apiUrl, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete route: ${await response.text()}`)
      }

      // Clear routes and redirect
      setIsDialogOpen(false)
      router.push('/route')
    } catch (error) {
      console.error('Error deleting route:', error)
      setError('Error deleting route')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='relative'>
      {noData ? (
        // Show "No Route Found" if there is no data
        <div className='text-center text-gray-500 mt-4'>No Route Found</div>
      ) : (
        // Otherwise, display the map and button
        <div>
          <div>
            <div
              ref={mapContainerRef}
              className='h-[500px] w-full relative -z-50'
            />

            <button
              onClick={() => setIsDialogOpen(true)}
              className='bg-red-500 text-white px-4 py-2 rounded mt-4 disabled:opacity-50 text-sm'
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : t('Delete Route')}
            </button>
          </div>

          <div className='relative z-50'>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{dialog('Sure')}</DialogTitle>
                  <DialogDescription className='my-5'>
                    {dialog('Delete Paragraph')}
                  </DialogDescription>
                  <div className='flex gap-2 mt-4 items-center justify-center'>
                    <button
                      onClick={handleDeleteRoute}
                      className='bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 text-sm'
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : t('Delete Route')}
                    </button>
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className='bg-gray-500 text-white px-4 py-2 rounded text-sm'
                    >
                      {dialog('Cancel')}
                    </button>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewRoute
