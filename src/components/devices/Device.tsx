'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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

// DEVICE INTERFACE
import { Devices } from '@/types/devices'

const DevicesComponent = () => {
  // const [loading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [devices, setDevices] = useState<Devices[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  // Updated to use Device instead of Devices
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingDevice, setEditingDevice] = useState<Devices | null>(null)
  const [updatedDevice, setUpdatedDevice] = useState<Devices | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false) // New state for edit modal

  useEffect(() => {
    fetchDevices()
  }, [])

  // GET EMPLOYEE
  const fetchDevices = async () => {
    setLoading(true) // Start loading

    try {
      const response = await fetch(
        ` ${process.env.NEXT_PUBLIC_API_URL}/devices`
      )
      const data = await response.json()

      console.log('API Response:', data) // Debugging

      const employeesArray = Array.isArray(data)
        ? data
        : data.employees || data.data || []

      if (!Array.isArray(employeesArray)) {
        console.error('Employees data is not an array:', employeesArray)
        setDevices([]) // Fallback to empty array
      } else {
        setDevices(employeesArray)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setDevices([])
    } finally {
      setLoading(false) // Stop loading after fetching data
    }
  }

  // UPDATE EMPLOYEE
  const updateDevices = async () => {
    if (!updatedDevice) return
    setLoading(true) // Start loading

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/devices/${updatedDevice.device_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDevice),
        }
      )

      if (!response.ok) {
        const errorMessage = await response.text() // Get error details
        console.error('Failed to update employee:', errorMessage)
        throw new Error(`Failed to update employee: ${errorMessage}`)
      }

      setDevices((prev) =>
        prev.map((emp) =>
          emp.device_id === updatedDevice.device_id ? updatedDevice : emp
        )
      )

      setIsEditModalOpen(false) // Close the edit modal
      setUpdatedDevice(null) // Clear updated employee data
    } catch (error) {
      console.error(error)
    }
  }

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!updatedDevice) return

  //   if (e.target.name === 'age') {
  //     setUpdatedDevice({
  //       ...updatedDevice,
  //       [e.target.name]: parseInt(e.target.value) || 0,
  //     })
  //   } else {
  //     setUpdatedDevice({
  //       ...updatedDevice,
  //       [e.target.name]: e.target.value,
  //     })
  //   }
  // }

  const handleEditClick = (devices: Devices) => {
    setEditingDevice(devices)
    setUpdatedDevice(devices) // Load selected employee data for editing
    setIsEditModalOpen(true) // Open the edit modal
  }

  const filteredDevices = devices.filter(
    (device) =>
      device.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.vehicle_plate_num?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 7 // Change as needed

  // Calculate paginated data
  const indexOfLastEmployee = currentPage * itemsPerPage
  const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage
  const currentDevices = filteredDevices.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  )

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading)
    return (
      <div className='flex flex-col space-y-3'>
        <Skeleton className='h-[125px] w-full rounded-xl' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[80%]' />
        </div>
      </div>
    )

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <Input
          placeholder='Search devices...'
          className='max-w-sm'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* <Button variant='outline' onClick={() => setIsAddModalOpen(true)}>
          Add Device
        </Button> */}
      </div>

      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device Name</TableHead>
              <TableHead>Vehicle Plate Number</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentDevices.map((device) => (
              <TableRow key={device.device_id}>
                <TableCell>{device.device_name}</TableCell>
                <TableCell>{device.vehicle_plate_num}</TableCell>
                <TableCell>{device.employee?.contact_number}</TableCell>
                <TableCell>
                  {device.employee?.first_name}, {device.employee?.last_name}
                </TableCell>
                <TableCell>
                  <Badge className='bg-green-500 text-white hover:bg-green-600 py-1 px-2'>
                    {' '}
                    {device.status}
                  </Badge>
                </TableCell>
                <TableCell className='space-x-2'>
                  <Button
                    variant='outline'
                    onClick={() => handleEditClick(device)} // Set edit device state
                  >
                    Edit
                  </Button>
                  {/* <Button variant='destructive'>Delete</Button> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className='flex justify-center items-center space-x-6'>
        <Button
          variant='outline'
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <span className='text-sm'>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant='outline'
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>

      {/* <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
          </DialogHeader>
          <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6'>
            {['device_id', 'vehicle_plate_num', 'status', 'employee_id'].map(
              (field) => (
                <div key={field} className='sm:col-span-3'>
                  <label
                    htmlFor={field}
                    className='block text-sm font-medium text-white'
                  >
                    {field
                      .replace('_', ' ') // Replace underscores with spaces
                      .toLowerCase() // Convert the whole string to lowercase
                      .replace(/\b\w/g, (char) => char.toUpperCase())}{' '}
                  </label>
                  <div className='mt-2'>
                    <Input
                      id={field}
                      name={field}
                      placeholder={field.replace('_', ' ')}
                      value={
                        field === 'employee'
                          ? updatedDevice?.employee?.employee_id || '' // Extract a specific property
                          : updatedDevice?.[field as keyof Devices] || ''
                      }
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )
            )}
          </div>

          <DialogFooter>
            <Button onClick={updateDevices}>Save</Button>
            <Button variant='outline' onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  )
}

export default DevicesComponent
