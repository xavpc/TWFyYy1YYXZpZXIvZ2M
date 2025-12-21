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

import { Trash, MapPin } from 'lucide-react' // Import icons

interface OSMMapProps {
  route_id?: string
  route_name: string
}
interface CenterCoordinates {
  latitude: number
  longitude: number
}

interface CollectionPoint {
  id: string
  latitude: number
  longitude: number
  collection_point_name: string
}

import { useTranslations } from 'next-intl' // Import
import { useRouter } from 'next/navigation'

const ViewRoute: React.FC<OSMMapProps> = ({ route_id }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const routesRef = useRef<L.Polyline[]>([])
  const markersRef = useRef<L.Marker<any>[]>([])
  const routesMarkerRef = useRef<L.Marker<any>[]>([])

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [center, setCenter] = useState<CenterCoordinates>({
    latitude: 10.3157,
    longitude: 123.8854,
  })
  const [noData, setNoData] = useState(false) // Add state for tracking no data
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCollectionOpen, setIsCollectionOpen] = useState(false)
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoint[]>(
    []
  )

  const [showMarkers, setShowMarkers] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)

  const router = useRouter()

  const t = useTranslations('Route')
  const dialog = useTranslations('Dialog')

  useEffect(() => {
    const fetchData = async () => {
      await fetchCenterCoordinates()
      await fetchAndDisplayRoute()
      await fetchCollectionPoints()
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
    } catch (error) {
      console.error('Error fetching center coordinates:', error)
    }
  }

  //^ FETCHES AND DISPLAY ROUTE
  const fetchAndDisplayRoute = async () => {
    if (!route_id || !mapInstanceRef.current) return

    setIsLoading(false)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving/'

    try {
      const response = await fetch(
        `${API_URL}/route-coordinates/route/${route_id}`
      )
      const { data } = await response.json()

      if (!data?.length) {
        setNoData(true)
        return
      }

      const sortedCoordinates = data.sort(
        (a: any, b: any) => a.sequence - b.sequence
      )
      const waypoints = sortedCoordinates
        .map((coord: any) => `${coord.longitude},${coord.latitude}`)
        .join(';')

      const osrmResponse = await fetch(
        `${OSRM_BASE_URL}${waypoints}?overview=full&geometries=geojson`
      )
      const osrmData = await osrmResponse.json()

      if (!osrmData.routes?.length)
        throw new Error('OSRM did not return a valid route')

      const routeCoordinates = osrmData.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      )

      // Remove previous routes before adding new ones
      routesRef.current.forEach((route) => route.remove())
      routesRef.current = []

      const route = L.polyline(routeCoordinates, {
        color: 'blue',
        weight: 3,
        opacity: 0.7,
      }).addTo(mapInstanceRef.current)

      // Store the route reference
      routesRef.current.push(route)

      // Remove previous markers
      routesMarkerRef.current.forEach((marker) => marker.remove())
      routesMarkerRef.current = []

      // Add markers for each coordinate
      sortedCoordinates.forEach(
        ({ latitude, longitude, sequence }: Coordinate) => {
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
            iconAnchor: [10, -10],
          })

          const markerIcon = L.icon({
            iconUrl:
              'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })

          const sequenceMarker = L.marker(
            [parseFloat(latitude), parseFloat(longitude)],
            {
              icon: sequenceIcon,
            }
          ).addTo(mapInstanceRef.current!)

          const actualMarker = L.marker(
            [parseFloat(latitude), parseFloat(longitude)],
            {
              icon: markerIcon,
            }
          ).addTo(mapInstanceRef.current!)

          routesMarkerRef.current.push(sequenceMarker, actualMarker)
        }
      )
    } catch (error) {
      console.error('Error fetching route:', error)
      setError('Error fetching route')
    } finally {
      setIsLoading(false)
    }
  }

  //^ FETCHES COLLECTION POINTS
  const fetchCollectionPoints = async () => {
    if (!route_id || !mapInstanceRef.current) return

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    try {
      // Fetch collection points
      const response = await fetch(
        `${API_URL}/collection-points/route/${route_id}`
      )
      const { data } = await response.json()

      if (!Array.isArray(data) || !data.length) {
        setNoData(true)
        return
      }

      setCollectionPoints(data) // Store in state

      // Add markers to the map
      data.forEach(
        ({ latitude, longitude, collection_point_name }: CollectionPoint) => {
          const markerIcon = L.icon({
            iconUrl:
              '/images/trash-can-with-cover-from-side-view-svgrepo-com.svg',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          })

          const marker = L.marker([Number(latitude), Number(longitude)], {
            icon: markerIcon,
          })
            .addTo(mapInstanceRef.current!)
            .bindPopup(`<b>${collection_point_name}</b>`)

          markersRef.current.push(marker) // Store markers for potential cleanup
        }
      )
    } catch (error) {
      console.error('Error fetching collection points:', error)
      setError('Error fetching collection points')
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

  //^ DELETE COLLECTION
  const handleDeleteCollection = async () => {
    if (!route_id) return

    setIsLoading(true)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    try {
      const response = await fetch(
        `${API_URL}/collection-points/route/${route_id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to delete collection: ${await response.text()}`)
      }

      console.log('Collection deleted successfully')

      // Remove all markers from the map
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    } catch (error) {
      console.error('Error deleting collection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  //^ TOGGLE MARKER
  const toggleMarkers = () => {
    if (showMarkers) {
      markersRef.current.forEach((marker) => marker.remove())
    } else {
      markersRef.current.forEach((marker) =>
        marker.addTo(mapInstanceRef.current!)
      )
    }
    setShowMarkers(!showMarkers)
  }

  //^ TOGGLE ROUTES
  const toggleRoutes = () => {
    if (showRoutes) {
      routesRef.current.forEach((route) => route.remove())
      routesMarkerRef.current.forEach((marker) => marker.remove())
    } else {
      routesRef.current.forEach((route) => route.addTo(mapInstanceRef.current!))
      routesMarkerRef.current.forEach((route) =>
        route.addTo(mapInstanceRef.current!)
      )
    }
    setShowRoutes(!showRoutes)
  }

  return (
    <div className='relative'>
      <div>
        <div>
          <div
            ref={mapContainerRef}
            className='h-[500px] w-full relative z-10'
          />

          <div className='flex justify-between items-center'>
            <div className='flex gap-2'>
              <button
                onClick={toggleMarkers}
                className='bg-gray-500 p-2 rounded-full'
              >
                <Trash className='text-white' size={20} />
              </button>
              <button
                onClick={toggleRoutes}
                className='bg-blue-500 p-2 rounded-full'
              >
                <MapPin className='text-white' size={20} />
              </button>
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => setIsDialogOpen(true)}
                className='bg-red-500 text-white px-4 py-2 rounded mt-4 disabled:opacity-50 text-sm float-right'
                disabled={isLoading}
              >
                {t('Delete Route')}
              </button>
              <button
                onClick={() => setIsCollectionOpen(true)}
                className='bg-red-500 text-white px-4 py-2 rounded mt-4 disabled:opacity-50 text-sm float-right'
                disabled={isLoading}
              >
                {t('Delete Collection')}
              </button>
            </div>
          </div>
        </div>

        <div className='relative z-50'>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{dialog('Sure')}</DialogTitle>
                <DialogDescription>
                  <div className='my-5'>{dialog('Delete Paragraph')}</div>
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
        <div className='relative z-50'>
          <Dialog open={isCollectionOpen} onOpenChange={setIsCollectionOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{dialog('Sure')}</DialogTitle>
                <DialogDescription>
                  <div className='my-5'>{dialog('Delete Paragraph')}</div>
                </DialogDescription>
                <div className='flex gap-2 mt-4 items-center justify-center'>
                  <button
                    onClick={handleDeleteCollection} // Add the function here
                    className='bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 text-sm'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading' : t('Delete Collection')}
                  </button>
                  <button
                    onClick={() => setIsCollectionOpen(false)}
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
    </div>
  )
}

export default ViewRoute
