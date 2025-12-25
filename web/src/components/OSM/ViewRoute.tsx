import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
  DialogFooter,
} from '@/components/ui/dialog'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import { Checkbox } from '@/components/ui/checkbox'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '@/components/ui/select'

import { Button } from '@/components/ui/button'

import { Trash, MapPin, Ellipsis, Slash } from 'lucide-react' // Import icons
import { CenterCoordinates } from '@/types/center-coordinates'

interface OSMMapProps {
  route_id?: string
  route_name: string
}

import { useTranslations } from 'next-intl' // Import
import { useRouter } from 'next/navigation'
import { Badge } from '../ui/badge'

import { DeviceRoute } from '@/types/device-route'
import { CollectionPoints } from '@/types/collection-points'
import { Devices } from '@/types/devices'
import toast from 'react-hot-toast'

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
  const [isDeviceOpen, setIsDeviceOpen] = useState(false)
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoints[]>(
    []
  )

  const [showMarkers, setShowMarkers] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const [deviceRoutes, setDeviceRoutes] = useState<DeviceRoute[]>([])
  const [isDeviceDeleteOpen, setDeviceDeleteOpen] = useState(false)
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [devices, setDevices] = useState<Devices[]>([])

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null) // Track selected route
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const daysOfWeek = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]

  const [selectedDays, setSelectedDays] = useState<string[]>([])

  const router = useRouter()

  const t = useTranslations('Route')
  const dialog = useTranslations('Dialog')
  const deviceTranslate = useTranslations('Device')
  const device = useTranslations('Device')

  useEffect(() => {
    const fetchData = async () => {
      await fetchCenterCoordinates()
      await fetchAndDisplayRoute()
      await fetchCollectionPoints()
      await fetchDeviceRoute()
      await fetchDevices()
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

  const handleCheckboxChange = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

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
        parseFloat(coord.longitude),
      ])

      // Remove previous routes before adding new ones
      routesRef.current.forEach((route) => route.remove())
      routesRef.current = []

      const route = L.polyline(routePoints, {
        color: 'blue',
        weight: 5,
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
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })

      // Create end marker (red)
      const endIcon = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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
        ({ latitude, longitude, collection_point_name }: CollectionPoints) => {
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
    if (!route_id) {
      console.error('Error: route_id is missing')
      return
    }

    setIsLoading(true)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    try {
      console.log(
        `Deleting from: ${API_URL}/collection-points/route/${route_id}`
      )

      const response = await fetch(
        `${API_URL}/collection-points/route/${route_id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete collection: ${errorText}`)
      }

      console.log('Collection deleted successfully')

      // Remove all markers if they exist
      if (markersRef.current) {
        markersRef.current.forEach((marker) => marker.remove())
        markersRef.current = []
      }

      setIsCollectionOpen(false)
    } catch (error) {
      console.error('Error deleting collection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  //^ TOGGLE MARKERS
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
        `${process.env.NEXT_PUBLIC_API_URL}/device-routes/route/${route_id}?groupByDevice=true`
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

  //^ DELETE DEVICE BY ID
  const handleDeleteDeviceById = async (device_route_id: string) => {
    setIsLoading(true) // Start loading

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/device-routes/${device_route_id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error(`Failed to delete device: ${response.status}`)
      }

      console.log('Device successfully deleted')

      // ✅ Ideally, remove the device from the UI state instead of reloading
      setDeviceRoutes((prevDevices) =>
        prevDevices.filter(
          (device) => device.device_route_id !== device_route_id
        )
      )

      setDeviceDeleteOpen(false)
    } catch (error) {
      console.error('Error deleting device:', error)
    } finally {
      setIsLoading(false) // Stop loading
    }
  }

  //^ DELETE DEVICE
  const handleDeleteDevice = async () => {
    setIsLoading(true) // Start loading

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/device-routes/route/${route_id}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error(`Failed to delete device: ${response.status}`)
      }

      console.log('Device successfully deleted')
    } catch (error) {
      console.error('Error deleting device:', error)
    } finally {
      setIsLoading(false) // Stop loading
      window.location.reload()
    }
  }

  //^ ADD DEVICE TO ROUTE
  const addDeviceToRoute = async (
    deviceId: string,
    routeId: string,
    selectedDay: string
  ) => {
    if (!deviceId || !routeId) {
      console.error('Device ID and Route ID are required')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/device-routes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_id: deviceId,
            route_id: routeId,
            day_assigned: selectedDay, // Use selected day from the dropdown
          }),
        }
      )

      if (!response.ok) {
        const errorMessage = await response.text()
        throw new Error(`Failed to add device: ${errorMessage}`)
      }

      toast.success('Assign device to route is successfully! 🎉')
      console.log('Device successfully assigned to route')

      setIsAddDeviceOpen(false) // Close the modal
    } catch (error) {
      console.error('Error adding device to route:', error)
      toast.error('Failed to assign device to route. Please try again! ❌')
    } finally {
      setIsLoading(false)
    }
  }

  //^ SET ADD DEVICE SAVE
  const handleSave = async () => {
    if (!selectedDeviceId || selectedDays.length === 0 || !selectedRouteId)
      return

    setIsLoading(true)

    try {
      // Loop through all selected days and call the API one by one
      for (const day of selectedDays) {
        await addDeviceToRoute(selectedDeviceId, selectedRouteId, day)
      }

      toast.success('Device assigned to selected days successfully! 🎉')

      // Reset state
      setIsAddDeviceOpen(false)
      setSelectedDeviceId(null)
      setSelectedDays([])
    } catch (error) {
      console.error('Failed to assign device to route:', error)
      toast.error('Some assignments failed. Please check logs. ❌')
    } finally {
      setIsLoading(false)
    }
  }

  //^ GET DEVICE
  const fetchDevices = async () => {
    setIsLoading(true) // Start loading

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/devices`)
      const data = await response.json()

      const deviceArray = Array.isArray(data)
        ? data
        : data.posts || data.data || []

      if (!Array.isArray(deviceArray)) {
        console.error('Posts data is not an array:', deviceArray)
        setDevices([]) // Fallback to empty array
      } else {
        setDevices(deviceArray)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setDevices([])
    } finally {
      setIsLoading(false) // Stop loading after fetching data
    }
  }

  return (
    <div className='relative'>
      <div>
        <div className='flex justify-between items-center'>
          <div>
            <Breadcrumb className='mb-5'>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href='/route'>{t('Route')}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>
                <BreadcrumbItem>{t('View Route')}</BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div>
            <Breadcrumb className='mb-5'>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/route/${route_id}`}>
                    {t('Add Route')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/route/add_collection/${route_id}`}>
                    {t('Add Collection')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <Slash />
                </BreadcrumbSeparator>
                {/* Add Device Button */}

                <BreadcrumbItem>
                  <Button
                    className='bg-green-500 text-white hover:bg-green-800'
                    size='sm'
                    onClick={() => {
                      if (route_id !== undefined) {
                        setSelectedRouteId(route_id)
                        setIsAddDeviceOpen(true)
                      }
                    }}
                  >
                    {t('Add Device')}
                  </Button>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <div className='flex justify-between items-center'>
          <div className='flex gap-2'>
            <button
              onClick={toggleMarkers}
              className={`p-2 rounded-full transition-colors ${
                showMarkers ? 'bg-gray-500' : 'bg-blue-500'
              }`}
            >
              <Trash className='text-white' size={20} />
            </button>
            <button
              onClick={toggleRoutes}
              className={`p-2 rounded-full transition-colors ${
                showRoutes ? 'bg-gray-500' : 'bg-blue-500'
              }`}
            >
              <MapPin className='text-white' size={20} />
            </button>
          </div>
          <div className='flex gap-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='p-2 bg-gray-500 rounded-full'>
                  <Ellipsis
                    className='cursor-pointer bg-gray-500 rounded-full text-white '
                    size={20}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-40'>
                <DropdownMenuItem
                  onClick={() => setIsDialogOpen(true)}
                  disabled={isLoading}
                  className='cursor-pointer'
                >
                  {t('Delete Route')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsCollectionOpen(true)}
                  disabled={isLoading}
                  className='cursor-pointer'
                >
                  {t('Delete Collection')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeviceOpen(true)}
                  disabled={isLoading}
                  className='cursor-pointer'
                >
                  {t('Delete Device')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className='mt-5'>
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
                    <TableHead>{deviceTranslate('Device Name')}</TableHead>
                    <TableHead>
                      {deviceTranslate('Vehicle Plate Number')}
                    </TableHead>
                    <TableHead>{deviceTranslate('Day Assigned')}</TableHead>
                    <TableHead>{deviceTranslate('Status')}</TableHead>
                    <TableHead>{deviceTranslate('Action')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deviceRoutes.length > 0 ? (
                    deviceRoutes.map((route, index) => (
                      <TableRow
                        key={route.device_route_id || `device-${index}`}
                      >
                        <TableCell>
                          {route.device?.device_name || 'No Name'}
                        </TableCell>

                        <TableCell>
                          {route.device?.vehicle_plate_num || 'No Plate'}
                        </TableCell>
                        <TableCell>
                          {route.day_assigned ? 
                            route.day_assigned.split(', ').map(day => 
                              deviceTranslate(day)
                            ).join(', ') : 
                            'No Day Assigned'
                          }
                        </TableCell>
                        <Badge
                          className={`text-white px-3 text-center my-4 ${
                            route.device?.status === 'active'
                              ? 'bg-green-500 hover:bg-green-600 text-xs py-1 w-17'
                              : 'bg-red-500 hover:bg-red-600 text-xs py-1.5 w-17'
                          } `}
                        >
                          {deviceTranslate(route.device?.status) || 'No Status'}
                        </Badge>
                        <TableCell>
                          <button
                            onClick={() => setDeviceDeleteOpen(true)}
                            className='bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 text-sm'
                          >
                            Delete
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center'>
                        {deviceTranslate('No Device Found')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </div>
        <div className='relative z-50'>
          <Dialog open={isDeviceOpen} onOpenChange={setIsDeviceOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{dialog('Sure')}</DialogTitle>
                <DialogDescription>
                  <div className='my-5'>{dialog('Delete Paragraph')}</div>
                </DialogDescription>
                <div className='flex gap-2 mt-4 items-center justify-center'>
                  <button
                    onClick={handleDeleteDevice}
                    className='bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 text-sm'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : t('Delete Device')}
                  </button>
                  <button
                    onClick={() => setIsDeviceOpen(false)}
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

        {/* ADD DEVICE DIALOG */}
        <div className='relative z-50'>
          <Dialog open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('Add Device')}</DialogTitle>
              </DialogHeader>
              <div className='mt-2'>
                {/* Device Selection */}
                <h2 className='text-sm mb-2'>{t('Device Name')}:</h2>
                <Select onValueChange={(value) => setSelectedDeviceId(value)}>
                  <SelectTrigger className='w-[280px]'>
                    <SelectValue placeholder={t('Device Name')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t('Device Name')}</SelectLabel>
                      {devices
                        .filter((device) => !!device.device_id)
                        .map((device) => (
                          <SelectItem
                            key={device.device_id}
                            value={device.device_id!}
                            className='cursor-pointer hover:bg-zinc-800'
                          >
                            {device.device_name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Day Checkboxes */}
                <h2 className='text-sm mt-5 mb-2'>{t('Day Assigned')}:</h2>
                <div className='grid grid-cols-2 gap-2'>
                  {daysOfWeek.map((day) => (
                    <label key={day} className='flex items-center space-x-2'>
                      <Checkbox
                        checked={selectedDays.includes(day)}
                        onCheckedChange={() => handleCheckboxChange(day)}
                        id={`day-${day}`}
                      />
                      <span className='capitalize text-sm'>{device(day)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleSave}
                  disabled={!selectedDeviceId || selectedDays.length === 0}
                >
                  {t('Save')}
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setIsAddDeviceOpen(false)}
                >
                  {t('Cancel')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {/* DELETE DEVICE BY ID */}
        <div className='relative z-50'>
          <Dialog open={isDeviceDeleteOpen} onOpenChange={setDeviceDeleteOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{dialog('Sure')}</DialogTitle>
                <DialogDescription>
                  <div className='my-5'>{dialog('Delete Paragraph')}</div>
                </DialogDescription>
                <div className='flex gap-2 mt-4 items-center justify-center'>
                  <button
                    onClick={() =>
                      deviceRoutes.length > 0 &&
                      handleDeleteDeviceById(deviceRoutes[0].device_route_id)
                    }
                    className='bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 text-sm'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : t('Delete Device')}
                  </button>
                  <button
                    onClick={() => setDeviceDeleteOpen(false)}
                    className='bg-gray-500 text-white px-4 py-2 rounded text-sm'
                  >
                    {dialog('Cancel')}
                  </button>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        {/* DELETE COLLECTION DIALOG */}
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
