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
import { Device } from '@/types/devices'

const Devices = () => {
  // const [loading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [devices, setDevices] = useState<Devices[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  // Updated to use Device instead of Devices
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [updatedDevice, setUpdatedDevice] = useState<Device | null>(null)

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
                  <Badge variant='outline'> {device.status}</Badge>
                </TableCell>
                <TableCell className='space-x-2'>
                  <Button
                    variant='outline'
                    onClick={() => setEditingDevice(device)} // Set edit device state
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
    </div>
  )
}

export default Devices
