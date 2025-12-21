import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { Loader2 } from 'lucide-react'

interface OSMMapProps {
  route_id?: string
  route_name: string
}
interface CenterCoordinates {
  latitude: number
  longitude: number
}

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

  const clearRoutes = () => {
    routesRef.current.forEach((route) => route.remove())
    routesRef.current = []
  }

  const fetchAndDisplayRoute = async () => {
    if (!route_id || !mapInstanceRef.current) return

    setIsLoading(true)
    setError(null)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving/'

    try {
      // Fetch route coordinates
      const response = await fetch(
        `${API_URL}/route-coordinates/route/${route_id}`
      )
      if (!response.ok)
        throw new Error(`Failed to fetch route: ${await response.text()}`)

      const { data } = await response.json()
      if (!data?.length) throw new Error('No route data found')

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
      const markerIcon = L.icon({
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })

      // Add markers for each coordinate
      sortedCoordinates.forEach(({ latitude, longitude }) => {
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

  return (
    <div>
      {/* <div>
        <h1>View Route {route_name}</h1>
      </div> */}
      <div>
        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isLoading && <Loader2 className='animate-spin mx-auto mb-4' />}
        <div>
          <div ref={mapContainerRef} className='h-[500px] w-full  disabled' />
        </div>
      </div>
    </div>
  )
}

export default ViewRoute
