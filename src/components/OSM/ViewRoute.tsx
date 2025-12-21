import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface OSMMapProps {
  route_id?: string
  route_name: string
}

const ViewRoute: React.FC<OSMMapProps> = ({ route_id, route_name }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const routesRef = useRef<L.Polyline[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
        center: [10.3157, 123.8854],
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
  }, [])

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

      const coordinates: L.LatLngExpression[] = sortedCoordinates.map(
        (coord: any) => [
          parseFloat(coord.latitude),
          parseFloat(coord.longitude),
        ]
      )

      if (coordinates.length === 0) {
        throw new Error('Route has no coordinates')
      }

      const route = L.polyline(coordinates, {
        color: 'blue',
        weight: 3,
        opacity: 0.7,
      })

      route.addTo(mapInstanceRef.current)
      routesRef.current.push(route)
    } catch (error) {
      console.error('Error fetching route:', error)
      setError('Error fetching route')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAndDisplayRoute()
  }, [route_id]) // Fetch new route when route_id changes

  return (
    <Card>
      <CardHeader>
        <CardTitle>View Route {route_name}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isLoading && <Loader2 className='animate-spin mx-auto mb-4' />}
        <div>
          <div
            ref={mapContainerRef}
            className='h-[500px] w-full  disabled'
            style={{ cursor: isLoading ? 'wait' : 'crosshair' }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default ViewRoute
