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

    try {
      setIsLoading(true)
      setError(null)

      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      }/route-coordinates/route/${route_id}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`Failed to fetch route: ${await response.text()}`)
      }

      const { data } = await response.json()
      if (!data || data.length === 0) {
        throw new Error('No route data found')
      }

      // Sort the data by sequence
      const sortedCoordinates = data.sort(
        (a: any, b: any) => a.sequence - b.sequence
      )

      const osrmBaseUrl = 'https://router.project-osrm.org/route/v1/driving/'

      // Convert coordinates to an OSRM query string
      const waypoints = sortedCoordinates
        .map((coord: any) => `${coord.longitude},${coord.latitude}`)
        .join(';')

      const osrmUrl = `${osrmBaseUrl}${waypoints}?overview=full&geometries=geojson`

      const osrmResponse = await fetch(osrmUrl)
      const osrmData = await osrmResponse.json()

      if (!osrmData.routes || osrmData.routes.length === 0) {
        throw new Error('OSRM did not return a valid route')
      }

      // Convert OSRM response to Leaflet-compatible coordinates
      const routeCoordinates = osrmData.routes[0].geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]] // Swap [lng, lat] -> [lat, lng]
      )

      // Create polyline using OSRM-generated route
      const route = L.polyline(routeCoordinates, {
        color: 'blue',
        weight: 3,
        opacity: 0.7,
      }).addTo(mapInstanceRef.current)

      routesRef.current.push(route)

      route.addTo(mapInstanceRef.current)
      routesRef.current.push(route)

      // Add markers to each coordinate
      const markerIcon = L.icon({
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize: [25, 41], // Default Leaflet icon size
        iconAnchor: [12, 41], // Ensures marker bottom aligns with location
        popupAnchor: [1, -34],
      })

      sortedCoordinates.forEach((coord: any) => {
        const marker = L.marker(
          [parseFloat(coord.latitude), parseFloat(coord.longitude)],
          { icon: markerIcon }
        )
        marker.addTo(mapInstanceRef.current)
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
