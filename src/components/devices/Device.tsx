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

import { useTranslations } from 'next-intl' // Import

// DEVICE INTERFACE
import { Devices } from '@/types/devices'
import { Employee } from '@/types/employees'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog'

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'

const DevicesComponent = () => {
  // const [loading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [devices, setDevices] = useState<Devices[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [editingDevice, setEditingDevice] = useState<Devices | null>(null)
  const [updatedDevice, setUpdatedDevice] = useState<Devices | null>(null)

  const [isEditDeviceModalOpen, setIsEditDeviceModalOpen] = useState(false) // New state for edit modal
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false)

  const [newDevice, setNewDevice] = useState<Devices | null>(null)

  const t = useTranslations('Device') // Ensure
  const pagination = useTranslations('Pagination') // Ensure

  useEffect(() => {
    fetchDevices()
  }, [])

  useEffect(() => {
    if (isEditDeviceModalOpen) {
      fetchEmployees()
    }

    if (isAddDeviceModalOpen) {
      fetchEmployees()
    }
  }, [isEditDeviceModalOpen, isAddDeviceModalOpen])

  //^ FETCH EMPLOYEES
  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employees`
      )
      const result = await response.json()

      if (result.success && Array.isArray(result.data)) {
        setEmployees(result.data) // Set the employees from `data` property
      } else {
        console.error('Invalid employees data:', result)
        setEmployees([]) // Reset to empty array if unexpected response
      }

      console.log(result)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([]) // Handle errors gracefully
    }
  }

  //^ ADD DEVICE
  const addDevice = async ({ device_id, ...newAddDevice }: Devices) => {
    setLoading(true) // Start loading

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/devices`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAddDevice),
        }
      )

      if (!response.ok) {
        const errorMessage = await response.text()
        console.error('Failed to add device:', errorMessage)
        throw new Error(`Failed to add device: ${errorMessage}`)
      }

      const newDevice: Devices = await response.json()
      console.log('Device added successfully:', newDevice)

      setIsAddDeviceModalOpen(false) // Close modal
      setNewDevice(null) // Reset form input with an empty object (not null)

      fetchDevices()
    } catch (error) {
      console.error('Error adding device:', error)
    } finally {
      setLoading(false) // Stop loading
    }
  }

  //^ GET DEVICES
  const fetchDevices = async () => {
    setLoading(true) // Start loading

    try {
      const response = await fetch(
        ` ${process.env.NEXT_PUBLIC_API_URL}/devices`
      )
      const data = await response.json()

      console.log('API Response:', data) // Debugging

      const devicesArray = Array.isArray(data)
        ? data
        : data.devices || data.data || []

      if (!Array.isArray(devicesArray)) {
        console.error('devices data is not an array:', devicesArray)
        setDevices([]) // Fallback to empty array
      } else {
        setDevices(devicesArray)
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
      setDevices([])
    } finally {
      setLoading(false) // Stop loading after fetching data
    }
  }

  //^ UPDATE DEVICE
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
        prev.filter((emp) => emp.device_id !== updatedDevice.device_id)
      )

      setIsEditDeviceModalOpen(false) // Close the edit modal
      setUpdatedDevice(null) // Clear updated employee data
    } catch (error) {
      console.error(error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!updatedDevice) return
    setUpdatedDevice({ ...updatedDevice, [e.target.name]: e.target.value })
  }

  const handleNewDeviceInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setNewDevice((prev) => ({
      ...prev!,
      [name]: value,
    }))
  }

  const handleNewDeviceChange = (value: string) => {
    const selectedEmployee = employees.find((emp) => emp.employee_id === value)

    if (selectedEmployee) {
      setNewDevice((prev) => ({
        ...prev,
        employee: {
          ...selectedEmployee,
          middle_name: selectedEmployee.middle_name || '', // Convert null to an empty string
        },
        contact_number: selectedEmployee.contact_number, // Automatically update contact number
        device_id: prev?.device_id || '', // Ensure device_id is not undefined
        device_name: prev?.device_name || '', // Ensure device_name is not undefined
        vehicle_plate_num: prev?.vehicle_plate_num || '', // Ensure vehicle_plate_num is not undefined
        status: prev?.status || 'active', // Ensure status is not undefined
      }))
    }
  }

  const handleEmployeeChange = (value: string) => {
    const selectedEmployee = employees.find((emp) => emp.employee_id === value)

    if (selectedEmployee) {
      setNewDevice((prev) => ({
        ...prev,
        employee: {
          ...selectedEmployee,
          middle_name: selectedEmployee.middle_name || '',
        },
        contact_number: selectedEmployee.contact_number, // Auto-update contact number
        device_name: prev?.device_name || '',
        vehicle_plate_num: prev?.vehicle_plate_num || '',
        status: prev?.status || '',
      }))
    }
  }

  const handleEditClick = (devices: Devices) => {
    setEditingDevice(devices)
    setUpdatedDevice(devices) // Load selected employee data for editing
    setIsEditDeviceModalOpen(true) // Open the edit modal
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
          placeholder={t('Search devices')}
          className='max-w-sm'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant='outline' onClick={() => setIsAddDeviceModalOpen(true)}>
          {t('Add Device')}
        </Button>
      </div>

      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Device Name')}</TableHead>
              <TableHead>{t('Vehicle Plate Number')}</TableHead>
              <TableHead>{t('Contact Number')}</TableHead>
              <TableHead>{t('Employee')}</TableHead>
              <TableHead>{t('Status')}</TableHead>
              <TableHead>{t('Action')}</TableHead>
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
                  <Badge
                    className={`text-white px-3 text-center text-xs ${
                      device.status === 'active'
                        ? 'bg-green-500 hover:bg-green-600  py-1 w-17'
                        : 'bg-red-500 hover:bg-red-600  py-1 w-17'
                    } `}
                  >
                    {' '}
                    {device.status === 'active'
                      ? t('active').toLowerCase()
                      : t('inactive').toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className='space-x-2'>
                  <Button
                    variant='outline'
                    onClick={() => handleEditClick(device)} // Set edit device state
                  >
                    {t('Edit')}
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
          {pagination('Previous')}
        </Button>
        <span className='text-sm'>
          {pagination('Page')} {currentPage} {pagination('of')} {totalPages}
        </span>
        <Button
          variant='outline'
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          {pagination('Next')}
        </Button>
      </div>

      {/* EDIT DEVICE MODAL */}
      <div className='relative z-50'>
        <Dialog
          open={isEditDeviceModalOpen}
          onOpenChange={setIsEditDeviceModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('Edit Device')}</DialogTitle>
            </DialogHeader>
            {updatedDevice && (
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label htmlFor='device_name' className='text-sm'>
                    {t('Device Name')}
                  </label>
                  <Input
                    name='device_name'
                    value={updatedDevice.device_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor='vehicle_plate_num' className='text-sm'>
                    {t('Vehicle Plate Number')}
                  </label>
                  <Input
                    name='vehicle_plate_num'
                    value={updatedDevice.vehicle_plate_num}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor='contact_number' className='text-sm'>
                    {t('Contact Number')}
                  </label>
                  <Input
                    name='contact_number'
                    value={updatedDevice.employee?.contact_number || ''}
                    onChange={handleInputChange}
                    readOnly // Makes it read-only to prevent manual edits
                    disabled
                  />
                </div>
                <div>
                  <label htmlFor='employee' className='text-sm'>
                    {t('Employee')}
                  </label>
                  <Select
                    name='employee'
                    value={updatedDevice?.employee?.employee_id || ''}
                    onValueChange={handleEmployeeChange} // Call the function here
                  >
                    <SelectTrigger className='border p-2 rounded-md w-full'>
                      <SelectValue placeholder='Select Employee' />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem
                          key={employee.employee_id}
                          value={employee.employee_id}
                        >
                          {employee.first_name} {employee.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={updateDevices}>{t('Save')}</Button>
              <Button
                onClick={() => setIsEditDeviceModalOpen(false)}
                variant='outline'
              >
                {t('Cancel')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ADD DEVICE MODAL */}
      <div className='relative z-50'>
        <Dialog
          open={isAddDeviceModalOpen}
          onOpenChange={setIsAddDeviceModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('Add Device')}</DialogTitle>
            </DialogHeader>
            <div className='grid grid-cols-2 gap-4'>
              {/* Device Name */}
              <div>
                <label htmlFor='device_name' className='text-sm'>
                  {t('Device Name')}
                </label>
                <Input
                  name='device_name'
                  value={newDevice?.device_name}
                  onChange={handleNewDeviceInputChange}
                />
              </div>

              {/* Vehicle Plate Number */}
              <div>
                <label htmlFor='vehicle_plate_num' className='text-sm'>
                  {t('Vehicle Plate Number')}
                </label>
                <Input
                  name='vehicle_plate_num'
                  value={newDevice?.vehicle_plate_num}
                  onChange={handleNewDeviceInputChange}
                />
              </div>

              {/* Contact Number (Auto-filled from selected Employee) */}
              <div>
                <label htmlFor='contact_number' className='text-sm'>
                  {t('Contact Number')}
                </label>
                <Input
                  name='contact_number'
                  value={newDevice?.employee?.contact_number}
                  readOnly
                  disabled
                />
              </div>

              {/* Employee Selection */}
              <div>
                <label htmlFor='employee' className='text-sm'>
                  {t('Employee')}
                </label>
                <Select
                  name='employee'
                  value={newDevice?.employee?.employee_id}
                  onValueChange={handleNewDeviceChange}
                >
                  <SelectTrigger className='border p-2 rounded-md w-full'>
                    <SelectValue placeholder='Select Employee' />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem
                        key={employee.employee_id}
                        value={employee.employee_id}
                      >
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dialog Footer */}
            <DialogFooter>
              <Button onClick={() => newDevice && addDevice(newDevice)}>
                {t('Add')}
              </Button>
              <Button
                onClick={() => setIsAddDeviceModalOpen(false)}
                variant='outline'
              >
                {t('Cancel')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default DevicesComponent
