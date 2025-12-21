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
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl' // Import useTranslations

const Route = () => {
  const [routes, setRoutes] = useState<RouteName[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [newRouteName, setNewRouteName] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetchRoutes()
  }, [])

  // GET ROUTE NAMES
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

  // ADD ROUTE NAME
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

      await fetchRoutes() // Refresh list
      setIsAddModalOpen(false)
      setNewRouteName('') // Reset input
    } catch (error) {
      console.error('Error adding route:', error)
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

  const t = useTranslations('Route') // Ensure
  const pagination = useTranslations('Pagination') // Ensure

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
          placeholder='Search Route Name...'
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
              <TableHead className='w-1/2'>{t('Action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRoutes.map((route) => (
              <TableRow key={route.route_id}>
                <TableCell>{route.route_name}</TableCell>
                <TableCell>
                  <div className='flex gap-2'>
                    <Button
                      className='bg-blue-500 text-white hover:bg-blue-800'
                      size='sm'
                      onClick={() => {
                        router.push(`/route/view/${route.route_id}`)
                      }}
                    >
                      {t('View')}
                    </Button>
                    <Button
                      className='bg-blue-500 text-white hover:bg-blue-800'
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
                  </div>
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

      {/* ADD ROUTE DIALOG */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Add Route')}</DialogTitle>
          </DialogHeader>
          <div>
            <label htmlFor='route'>{t('Route Name')}:</label>
            <Input
              placeholder='Route name...'
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
