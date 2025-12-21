import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react' // Add this import for the loading spinner

interface OSMMapProps {
  className?: string
  route_id?: string
}

const OSMMap: React.FC<OSMMapProps> = ({ route_id, className }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const routesRef = useRef<L.Polyline[]>([])
  const [error, setError] = useState<string | null>(null)
  const [clickCoords, setClickCoords] = useState<string>('No clicks yet')
  const [isLoading, setIsLoading] = useState(false) // Add loading state

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    try {
      // Fix Leaflet icon issues
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
        center: [10.3157, 123.8854], // Cebu
        zoom: 15,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      mapInstanceRef.current = map

      map.on('click', handleMapClick)

      return () => {
        markersRef.current.forEach((marker) => {
          if (marker) marker.remove()
        })

        routesRef.current.forEach((route) => {
          if (route) route.remove()
        })

        map.remove()
        mapInstanceRef.current = null
      }
    } catch (error) {
      console.error('Error initializing map:', error)
      setError('Failed to initialize map')
    }
  }, [route_id])

  const clearRoutes = () => {
    routesRef.current.forEach((route) => route.remove())
    routesRef.current = []
  }

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    // Prevent new clicks while loading
    if (isLoading) return

    const map = mapInstanceRef.current
    if (!map) return

    const { lat, lng } = e.latlng
    console.log('Map clicked at:', lat, lng)
    setClickCoords(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`)

    const marker = L.marker([lat, lng])
    marker.addTo(map)
    markersRef.current.push(marker)

    marker.bindPopup(`Point ${markersRef.current.length}`).openPopup()

    if (markersRef.current.length >= 2) {
      setIsLoading(true)
      try {
        await updateAllRoutes()
      } finally {
        setIsLoading(false)
      }
    }
  }

  const updateAllRoutes = async () => {
    const map = mapInstanceRef.current
    if (!map) return

    clearRoutes()

    const points = markersRef.current.map((marker) => marker.getLatLng())

    for (let i = 0; i < points.length - 1; i++) {
      try {
        const start = points[i]
        const end = points[i + 1]
        await getRoute(start, end)
      } catch (error) {
        console.error(`Error getting route for segment ${i}:`, error)
        setError(`Failed to fetch route segment ${i + 1}`)
      }
    }

    const allPoints = [...points]
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  // GET ROUTE
  const getRoute = async (start: L.LatLng, end: L.LatLng) => {
    const map = mapInstanceRef.current
    if (!map) return

    try {
      setError(null)
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      }/osrm/route`
      const response = await fetch(
        `${apiUrl}?start=${start.lat},${start.lng}&end=${end.lat},${end.lng}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch route: ${await response.text()}`)
      }

      const data = await response.json()

      if (data.routes?.[0]?.geometry?.coordinates) {
        const coordinates: L.LatLngExpression[] =
          data.routes[0].geometry.coordinates.map((coord: [number, number]) => [
            coord[1],
            coord[0],
          ])

        const route = L.polyline(coordinates, {
          color: 'blue',
          weight: 3,
          opacity: 0.7,
        })

        route.addTo(map)
        routesRef.current.push(route)
      }
    } catch (error) {
      console.error('Error fetching route:', error)
      throw error
    }
  }

  //   CREATE ROUTE SAVE
  const handleCreateRoute = async () => {
    if (markersRef.current.length === 0) {
      setError('No markers to save.')
      return
    }

    if (!route_id) {
      setError('Route ID is missing.')
      return
    }

    setIsLoading(true)
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/route-coordinates`

      for (let index = 0; index < markersRef.current.length; index++) {
        const marker = markersRef.current[index]
        const { lat, lng } = marker.getLatLng()

        const markerData = {
          latitude: lat,
          longitude: lng,
          route_id, // Include route_id in the request
          sequence: index + 1, // Ensure sequence starts from 1
        }

        console.log('Sending marker data:', markerData)

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(markerData),
        })

        const responseBody = await response.text()
        console.log('API Response:', response.status, responseBody)

        if (!response.ok) {
          throw new Error(
            `Failed to save marker. Server response: ${responseBody}`
          )
        }
      }

      console.log('All markers saved successfully!')
    } catch (error) {
      console.error('Error saving markers:', error)
      setError(`Failed to save markers: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardContent>
        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className='mb-4'>
          <Alert>
            <AlertDescription>
              Click points on the map to create a connected route. Routes will
              be calculated between all points in order.
              <br />
              Last click: {clickCoords}
            </AlertDescription>
          </Alert>
        </div>
        <div className='relative'>
          <div
            ref={mapContainerRef}
            className='h-[500px] w-full '
            style={{ cursor: isLoading ? 'wait' : 'crosshair' }}
          />
          {isLoading && (
            <div className='absolute inset-0 bg-black/10 flex items-center justify-center rounded-md'>
              <div className='bg-white p-4 rounded-lg shadow-lg flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Calculating route...</span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleCreateRoute}
          className='bg-blue-500 text-white px-4 py-2 rounded mt-4 disabled:opacity-50'
          disabled={isLoading}
        >
          {isLoading ? 'Creating Route...' : 'Create Route'}
        </button>
      </CardContent>
    </Card>
  )
}

export default OSMMap
