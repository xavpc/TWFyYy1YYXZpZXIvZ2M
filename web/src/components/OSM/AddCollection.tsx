import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Loader2, Slash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { CenterCoordinates } from '@/types/center-coordinates'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '../ui/breadcrumb'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CollectionPoints } from '@/types/collection-points'

interface OSMMapProps {
  route_id?: string
  route_name: string
}

const AddCollection: React.FC<OSMMapProps> = ({ route_id }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const collectionPointsMarkerRef = useRef<L.Marker[]>([])

  const routesRef = useRef<L.Polyline[]>([]) // Store drawn routes
  const markersRef = useRef<L.Marker<any>[]>([])

  const [center, setCenter] = useState<CenterCoordinates>({
    latitude: 10.3157,
    longitude: 123.8854,
  })
  const [clickCoords, setClickCoords] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [selectedMarker, setSelectedMarker] = useState<L.Marker | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [markerName, setMarkerName] = useState('')

  const [noData, setNoData] = useState(false) // Add state for tracking no data
  const [isCollectionOpen, setIsCollectionOpen] = useState(false)
  const [collectionPoints, setCollectionPoints] = useState<CollectionPoints[]>(
    []
  )

  const t = useTranslations('Route')
  const router = useRouter()

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
      map.on('click', handleMapClick)

      return () => {
        collectionPointsMarkerRef.current.forEach((marker) => marker.remove())
        routesRef.current.forEach((route) => route.remove()) // Remove drawn routes
        map.remove()
        mapInstanceRef.current = null
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }, [route_id])

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (isLoading) return

    const map = mapInstanceRef.current
    if (!map) return

    const { lat, lng } = e.latlng
    setClickCoords(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`)

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'custom-div-icon',
        html: `<div>
       <svg fill="#f32b2b" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 41.336 41.336" xml:space="preserve" stroke="#f32b2b"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M36.335,5.668h-8.167V1.5c0-0.828-0.672-1.5-1.5-1.5h-12c-0.828,0-1.5,0.672-1.5,1.5v4.168H5.001c-1.104,0-2,0.896-2,2 s0.896,2,2,2h2.001v29.168c0,1.381,1.119,2.5,2.5,2.5h22.332c1.381,0,2.5-1.119,2.5-2.5V9.668h2.001c1.104,0,2-0.896,2-2 S37.438,5.668,36.335,5.668z M14.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21c0-0.828,0.672-1.5,1.5-1.5 s1.5,0.672,1.5,1.5V35.67z M22.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21c0-0.828,0.672-1.5,1.5-1.5 s1.5,0.672,1.5,1.5V35.67z M25.168,5.668h-9V3h9V5.668z M30.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21 c0-0.828,0.672-1.5,1.5-1.5s1.5,0.672,1.5,1.5V35.67z"></path> </g> </g></svg>
        </div>`,

        iconSize: [10, 10],
      }),
    }).addTo(map)

    setSelectedMarker(marker)
    setIsDialogOpen(true) // open ShadCN dialog

    marker.on('click', () => handleDeleteMarker(marker))
  }

  const handleDeleteMarker = (marker: L.Marker) => {
    marker.remove()
    collectionPointsMarkerRef.current =
      collectionPointsMarkerRef.current.filter((m) => m !== marker)
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
      const newCenter = {
        latitude: parseFloat(data.center_latitude),
        longitude: parseFloat(data.center_longitude),
      }
      setCenter(newCenter)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(
          [newCenter.latitude, newCenter.longitude],
          15
        )
      }
      console.log(`route data`, data)
    } catch (error) {
      console.error('Error fetching center coordinates:', error)
    }
  }

  //^ FETCH AND DISPLAY ROUTE
  const fetchAndDisplayRoute = async () => {
    if (!route_id || !mapInstanceRef.current) return

    setIsLoading(true)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

    try {
      const response = await fetch(
        `${API_URL}/route-coordinates/route/${route_id}`
      )
      const { data } = await response.json()

      if (!data?.length) return

      const sortedCoordinates = data.sort(
        (a: any, b: any) => a.sequence - b.sequence
      )

      // Create array of coordinates for the polyline
      const routeCoordinates = sortedCoordinates.map((coord: any) => [
        parseFloat(coord.latitude),
        parseFloat(coord.longitude),
      ])

      // Draw the polyline directly with the coordinates
      const route = L.polyline(routeCoordinates, {
        color: 'blue',
        weight: 3,
        opacity: 0.7,
      }).addTo(mapInstanceRef.current as L.Map)
      routesRef.current.push(route)

      // Add only start marker (blue)
      const startPoint = routeCoordinates[0]
      L.marker(startPoint, {
        icon: L.icon({
          iconUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        }),
      }).addTo(mapInstanceRef.current!)

      // Add only end marker (red)
      const endPoint = routeCoordinates[routeCoordinates.length - 1]
      const redIcon = new L.Icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })

      L.marker(endPoint, { icon: redIcon }).addTo(mapInstanceRef.current!)
    } catch (error) {
      console.error('Error fetching route:', error)
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

  // ^ ADD COLLECTION
  const handleCreateCollection = async () => {
    if (!route_id || collectionPointsMarkerRef.current.length === 0) return

    setIsLoading(true)

    try {
      for (
        let index = 0;
        index < collectionPointsMarkerRef.current.length;
        index++
      ) {
        const marker = collectionPointsMarkerRef.current[index]
        const { lat, lng } = marker.getLatLng()
        const name =
          (marker as any).collection_point_name ||
          `Collection Point ${index + 1}, ${route_id}`

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/collection-points`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: lat,
              longitude: lng,
              collection_point_name: name,
              route_id,
              sequence: index + 1,
            }),
          }
        )

        const responseText = await response.text()

        if (!response.ok) {
          throw new Error(`Failed to create collection: ${responseText}`)
        }
      }

      console.log('All collection points saved successfully!')
      router.push(`/route/view/${route_id}`)
    } catch (error) {
      console.error('Error creating collection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  //^ DELETE ALL COLLECTION
  const handleDeleteCollection = () => {
    // Remove all collection point markers from the map
    collectionPointsMarkerRef.current.forEach((marker) => marker.remove())
    collectionPointsMarkerRef.current = []

    // Optionally reset any related state
    setClickCoords('No collection points')

    console.log('Collection points cleared!')
  }

  return (
    <div>
      <Breadcrumb className='mb-5'>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href='/route'>{t('Route')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>{t('Add Collection')}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className='mb-4'>
        <div className='bg-blue-500 p-4 text-sm rounded'>
          {t('Click Points')}
          <br />
          {t('Last Click')}: {clickCoords}
        </div>
      </div>
      <div className='relative'>
        <div
          ref={mapContainerRef}
          className='h-[500px] w-full relative z-20'
          style={{ cursor: isLoading ? 'wait' : 'crosshair' }}
        />
        {isLoading && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/10'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Processing...</span>
          </div>
        )}
      </div>
      <div className='flex gap-2'>
        <button
          onClick={handleCreateCollection}
          className='bg-blue-500 text-white px-4 py-2 rounded mt-4 disabled:opacity-50 text-sm'
          disabled={isLoading}
        >
          {isLoading ? 'Loading' : t('Create Collection')}
        </button>
        <button
          onClick={handleDeleteCollection} // Add the function here
          className='bg-red-500 text-white px-4 py-2 rounded mt-4 disabled:opacity-50 text-sm'
          disabled={isLoading}
        >
          {isLoading ? 'Loading' : t('Delete Collection')}
        </button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Collection Point')}</DialogTitle>
          </DialogHeader>
          <Input
            value={markerName}
            onChange={(e) => setMarkerName(e.target.value)}
            placeholder={t('Enter collection point name and adress')}
          />
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedMarker) {
                  const name =
                    markerName ||
                    `Collection Point ${
                      collectionPointsMarkerRef.current.length + 1
                    }`
                  ;(selectedMarker as any).collection_point_name = name

                  // Optionally: add to ref and bind a popup
                  selectedMarker.bindPopup(`<b>${name}</b>`)
                  collectionPointsMarkerRef.current.push(selectedMarker)
                  selectedMarker.on('click', () =>
                    handleDeleteMarker(selectedMarker)
                  )
                }

                // Reset dialog
                setMarkerName('')
                setSelectedMarker(null)
                setIsDialogOpen(false)
              }}
            >
              {t('Set')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddCollection
