import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { Trash, MapPin, EllipsisVertical } from 'lucide-react' // Import icons
import { CenterCoordinates } from '@/types/center-coordinates'
interface OSMMapProps {
  route_id?: string
  route_name: string
}


interface CollectionPoint {
  id: string
  latitude: number
  longitude: number
  collection_point_name: string
}

interface Route {
  route_id: string;
  route_name: string;
  center_latitude: string;
  center_longitude: string;
}


interface DeviceRoute {
  device_route_id: string;
  day_assigned: string;
  device: {
    device_id: string;
    device_name: string;
    vehicle_plate_num: string;
    status: string;
  };
  route: Route;
}
import { useTranslations } from 'next-intl' // Import
import { useRouter } from 'next/navigation'
import { Devices } from '@/types/devices'
import { Badge } from '../ui/badge'

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
  const [deviceRoutes, setDeviceRoutes] = useState<DeviceRoute[]>([])

  const router = useRouter()

  const t = useTranslations('Route')
  const dialog = useTranslations('Dialog')

  useEffect(() => {
    const fetchData = async () => {
      await fetchCenterCoordinates()
      await fetchAndDisplayRoute()
      await fetchCollectionPoints()
      await fetchDeviceRoute()
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
  
    setIsLoading(true)
  
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  
    try {
      const response = await fetch(
        `${API_URL}/route-coordinates/route/${route_id}`
      )
      const { data } = await response.json()
  
      if (!data?.length) {
        setNoData(true)
        return
      }
  
      // Sort coordinates by sequence
      const sortedCoordinates = data.sort(
        (a: any, b: any) => a.sequence - b.sequence
      )
  
      // Create route polyline from all coordinates
      const routePoints = sortedCoordinates.map((coord: any) => [
        parseFloat(coord.latitude),
        parseFloat(coord.longitude)
      ])
  
      // Remove previous routes before adding new ones
      routesRef.current.forEach((route) => route.remove())
      routesRef.current = []
  
      const route = L.polyline(routePoints, {
        color: 'blue',
        weight: 3,
        opacity: 0.7,
      }).addTo(mapInstanceRef.current)
  
      // Store the route reference
      routesRef.current.push(route)
  
      // Remove previous markers
      routesMarkerRef.current.forEach((marker) => marker.remove())
      routesMarkerRef.current = []
  
      // Only add start and end point markers
      const startPoint = routePoints[0]
      const endPoint = routePoints[routePoints.length - 1]
  
      // Create start marker (blue)
      const startIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
  
      // Create end marker (red)
      const endIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
  
      // Add start marker
      const startMarker = L.marker(startPoint, { icon: startIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('Start Point')
  
      // Add end marker
      const endMarker = L.marker(endPoint, { icon: endIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('End Point')
  
      routesMarkerRef.current.push(startMarker, endMarker)
  
      // Fit the map to show the entire route
      const bounds = L.latLngBounds(routePoints)
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
  
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

 //^ FETCH DEVICE ROUTE
  const fetchDeviceRoute = async () => {
    setIsLoading(true) // Start loading

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/device-routes/route/${route_id}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const data = await response.json()

      const deviceRouteArray = Array.isArray(data)
        ? data
        : data.posts || data.data || []

      console.log('Processed device route array:', deviceRouteArray) // 🔍 Log processed data

      if (!Array.isArray(deviceRouteArray)) {
        console.error('Device route data is not an array:', deviceRouteArray)
        setDeviceRoutes([]) // Fallback to empty array
      } else {
        setDeviceRoutes([...deviceRouteArray]) // 🔄 Force a re-render
      }

      console.log('Device routes successfully fetched')
    } catch (error) {
      console.error('Error fetching device routes:', error)
      setDeviceRoutes([])
    } finally {
      setIsLoading(false) // Stop loading
    }
  }


  return (
    <div className='relative'>
      <div>
        <div>
          <div
            ref={mapContainerRef}
            className='h-[500px] w-full relative z-10'
          />
        </div>

        {/* 🔹 Debugging Data Display */}
        <div className='p-4'>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Vehicle Plate Number</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deviceRoutes.length > 0 ? (
                    deviceRoutes.map((route, index) => (
                      <TableRow
                        key={route.device?.device_id || `device-${index}`}
                      >
                        <TableCell>
                          {route.device?.device_name || 'No Name'}
                        </TableCell>
                        <TableCell>
                          {route.device?.vehicle_plate_num || 'No Plate'}
                        </TableCell>
                        <Badge
                          className={`text-white px-3 text-center my-2 ${
                            route.device?.status === 'active'
                              ? 'bg-green-500 hover:bg-green-600 text-sm py-1 w-17'
                              : 'bg-red-500 hover:bg-red-600 text-xs py-1.5 w-17'
                          } `}
                        >
                          {route.device?.status || 'No Status'}
                        </Badge>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className='text-center'>
                        No devices found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </div>
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
              className='bg-red-500 text-white px-4 py-2 rounded mt-4 disabled:opacity-50 text-xs float-right'
              disabled={isLoading}
            >
              {t('Delete Route')}
            </button>
            <button
              onClick={() => setIsCollectionOpen(true)}
              className='bg-red-500 text-white px-4 py-2 rounded mt-4 disabled:opacity-50 text-xs float-right'
              disabled={isLoading}
            >
              {t('Delete Collection')}
            </button>
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
