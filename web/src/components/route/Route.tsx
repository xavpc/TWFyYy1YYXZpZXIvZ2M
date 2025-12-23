'use client'

import { useRouter } from 'next/navigation'
import { RouteName } from '@/types/routeName'
import { useEffect, useState } from 'react'

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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Input } from '@/components/ui/input'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { Devices } from '@/types/devices'
import { useTranslations } from 'next-intl' // Import useTranslations
import toast from 'react-hot-toast'

const Route = () => {
  const [routes, setRoutes] = useState<RouteName[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [newRouteName, setNewRouteName] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null) // Track selected route
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [devices, setDevices] = useState<Devices[]>([])

  const t = useTranslations('Route') // Ensure
  const device = useTranslations('Device')
  const pagination = useTranslations('Pagination') // Ensure
  const router = useRouter()
  const dialog = useTranslations('Dialog')

  useEffect(() => {
    fetchRoutes()
    fetchDevices()
  }, [])

  //^ GET ROUTE NAMES
  const fetchRoutes = async () => {
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/routes`)
      const data = await response.json()

      console.log('API Response:', data) // Debugging

      const routesArray = Array.isArray(data)
        ? data
        : data.routes || data.data || []

      if (!Array.isArray(routesArray)) {
        console.error('Routes data is not an array:', routesArray)
        setRoutes([])
      } else {
        setRoutes(routesArray)
      }
    } catch (error) {
      console.error('Error fetching Routes:', error)
      setRoutes([])
    } finally {
      setLoading(false)
    }
  }

  //^ ADD ROUTE NAME
  const addRouteName = async () => {
    if (!newRouteName.trim()) {
      console.error('Route name is required')
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/routes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ route_name: newRouteName }), // ✅ Send route_name
        }
      )

      if (!response.ok) {
        const errorMessage = await response.text()
        console.error('Failed to add route:', errorMessage)
        throw new Error(`Failed to add route: ${errorMessage}`)
      }

      toast.success('Route added successfully! 🎉')

      await fetchRoutes() // Refresh list
      setIsAddModalOpen(false)
      setNewRouteName('') // Reset input
    } catch (error) {
      console.error('Error adding route:', error)
      toast.error('Failed to route. Please try again! ❌')
    }
  }

  //^ GET DEVICE
  const fetchDevices = async () => {
    setLoading(true) // Start loading

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
      setLoading(false) // Stop loading after fetching data
    }
  }

  //^ ASSIGN DEVICE TO ROUTE
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

  const filteredRoutes = routes.filter(
    (route) =>
      route.route_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.route_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 5 // Change as needed

  // Calculate paginated data
  const indexOfLastRoute = currentPage * itemsPerPage
  const indexOfFirstRoute = indexOfLastRoute - itemsPerPage
  const currentRoutes = filteredRoutes.slice(
    indexOfFirstRoute,
    indexOfLastRoute
  )

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRoutes.length / itemsPerPage)
  )

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  //^ DELETE ROUTE
  const handleDeleteRoute = async () => {
    if (!selectedRouteId) return // Ensure a route is selected

    setIsLoading(true)

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/routes/${selectedRouteId}`

      const response = await fetch(apiUrl, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete route: ${await response.text()}`)
      }

      // Refresh list after successful delete
      toast.success('Device deleted successfully! 🎉')
      await fetchRoutes()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error deleting route:', error)
      // Show error toast
      toast.error('Failed to delete device. Please try again! ❌')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading)
    return (
      <div className='flex flex-col space-y-3 mt-4'>
        <Skeleton className='h-[125px] w-full rounded-xl' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[80%]' />
        </div>
      </div>
    )

  return (
    <>
      <div className='flex justify-between items-center mt-4'>
        <Input
          placeholder={t('Search Route Name')}
          className='max-w-sm'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant='outline' onClick={() => setIsAddModalOpen(true)}>
          {t('Add Route')}
        </Button>
      </div>

      <div className='mt-2 border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-1/2'> {t('Route Name')}</TableHead>
              <TableHead>{t('View')}</TableHead>
              <TableHead className='text-center'>{t('Add')}</TableHead>
              <TableHead>{t('Delete')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRoutes.map((route) => (
              <TableRow key={route.route_id}>
                <TableCell>{route.route_name}</TableCell>
                <TableCell>
                  <Button
                    className='bg-blue-500 text-white hover:bg-blue-800'
                    size='sm'
                    onClick={() => {
                      router.push(`/route/view/${route.route_id}`)
                    }}
                  >
                    {t('View')}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className='flex gap-2 justify-center'>
                    <Button
                      className='bg-green-500 text-white hover:bg-green-800'
                      size='sm'
                      onClick={() => {
                        console.log(
                          'Navigating to:',
                          `/route/${route.route_id}`
                        )
                        router.push(`/route/${route.route_id}`)
                      }}
                    >
                      {t('Add Route')}
                    </Button>
                    <Button
                      className='bg-green-500 text-white hover:bg-green-800'
                      size='sm'
                      onClick={() => {
                        router.push(`/route/add_collection/${route.route_id}`)
                      }}
                    >
                      {t('Add Collection Point')}
                    </Button>
                    <Button
                      className='bg-green-500 text-white hover:bg-green-800'
                      size='sm'
                      onClick={() => {
                        setSelectedRouteId(route.route_id) // Store selected route
                        setIsAddDeviceOpen(true) // Open modal
                      }}
                    >
                      {t('Add Device')}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    className='bg-red-500 text-white hover:bg-red-800'
                    size='sm'
                    onClick={() => {
                      setSelectedRouteId(route.route_id) // Set route ID before opening dialog
                      setIsDialogOpen(true)
                    }}
                  >
                    {t('Delete Route')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className='flex justify-center items-center space-x-6 mt-4'>
        <Button
          variant='outline'
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          {pagination('Previous')}
        </Button>
        <span className='text-sm'>
          {pagination('Page')} {currentPage} {pagination('of')} {totalPages}
        </span>
        <Button
          variant='outline'
          disabled={currentPage >= totalPages} // ✅ Fixed edge case when `totalPages` is 0
          onClick={() => handlePageChange(currentPage + 1)}
        >
          {pagination('Next')}
        </Button>
      </div>

      <div className='relative z-50'>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialog('Sure')}</DialogTitle>
              <DialogDescription>
                <div className='my-5'>{dialog('Delete Paragraph')}</div>
              </DialogDescription>
              <div className='flex gap-2 mt-8 items-center justify-center'>
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
              <h2 className='text-sm  mb-2'>{t('Device Name')}:</h2>
              <Select onValueChange={(value) => setSelectedDeviceId(value)}>
                <SelectTrigger className='w-[280px]'>
                  <SelectValue placeholder={t('Device Name')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('Device Name')}</SelectLabel>
                    {devices
                      .filter((device) => device.device_id) // Filter out devices with an empty ID
                      .map((device) => (
                        <SelectItem
                          key={device.device_id!}
                          value={device.device_id!}
                          className='cursor-pointer hover:bg-zinc-800'
                        >
                          {device.device_name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {/* Day Assigned Selection */}
              <h2 className='text-sm mt-5 mb-2'>{t('Day Assigned')}:</h2>
              <Select onValueChange={(value) => setSelectedDay(value)}>
                <SelectTrigger className='w-[280px]'>
                  <SelectValue placeholder={t('Select Day')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{device('Days')}</SelectLabel>
                    {[
                      'monday',
                      'tuesday',
                      'wednesday',
                      'thursday',
                      'friday',
                      'saturday',
                      'sunday',
                    ].map((day) => (
                      <SelectItem
                        key={day}
                        value={day.toLowerCase()} // Ensure value is lowercase for consistency
                        className='cursor-pointer hover:bg-zinc-800'
                      >
                        {device(day)} {/* Correctly translate each day */}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (selectedDeviceId && selectedDay) {
                    addDeviceToRoute(
                      selectedDeviceId as string,
                      selectedRouteId as string,
                      selectedDay as string
                    )
                  }
                }}
                disabled={!selectedDeviceId || !selectedDay} // Button is disabled if either is missing
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

      {/* ADD ROUTE DIALOG */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Add Route')}</DialogTitle>
          </DialogHeader>
          <div className='mt-2'>
            <label htmlFor='route' className='text-sm'>
              {t('Route Name')}:
            </label>
            <Input
              placeholder={t('Route Name')}
              className='mt-2'
              value={newRouteName}
              onChange={(e) => setNewRouteName(e.target.value)} // ✅ Bind input to state
            />
          </div>
          <DialogFooter>
            <Button onClick={addRouteName}> {t('Save')}</Button>
            <Button variant='outline' onClick={() => setIsAddModalOpen(false)}>
              {t('Cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Route
