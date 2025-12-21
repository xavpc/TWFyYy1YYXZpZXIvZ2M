'use client'

import { useEffect, useState } from 'react'

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

// EMPLOYEES INTERFACE
import { Employee } from '@/types/employees'

export default function EmployeeList() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false) //
  const [searchTerm, setSearchTerm] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [updatedEmployee, setUpdatedEmployee] = useState<Employee | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false) // New state for edit modal
  const [newEmployee, setNewEmployee] = useState<Employee>({
    employee_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    address: '',
    age: 18,
  })

  // GET ALL EMPLOYEES
  useEffect(() => {
    fetchEmployees()
  }, [])

  // GET EMPLOYEE
  const fetchEmployees = async () => {
    setLoading(true) // Start loading

    try {
      const response = await fetch(
        ` ${process.env.NEXT_PUBLIC_API_URL}/web.employees`
      )
      const data = await response.json()

      console.log('API Response:', data) // Debugging

      const employeesArray = Array.isArray(data)
        ? data
        : data.employees || data.data || []

      if (!Array.isArray(employeesArray)) {
        console.error('Employees data is not an array:', employeesArray)
        setEmployees([]) // Fallback to empty array
      } else {
        setEmployees(employeesArray)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    } finally {
      setLoading(false) // Stop loading after fetching data
    }
  }

  // ADD EMPLOYEE
  const addEmployee = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { employee_id, ...employeeWithoutId } = newEmployee // Exclude employee_id

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/web.employees`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeWithoutId),
        }
      )

      if (!response.ok) {
        const errorMessage = await response.text()
        console.error('Failed to add employee:', errorMessage)
        throw new Error(`Failed to add employee: ${errorMessage}`)
      }

      // Fetch updated employees list after adding
      await fetchEmployees()

      setIsAddModalOpen(false)
      setNewEmployee({
        employee_id: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        address: '',
        age: 20,
      })
    } catch (error) {
      console.error('Error adding employee:', error)
    }
  }

  // UPDATE EMPLOYEE
  const updateEmployee = async () => {
    if (!updatedEmployee) return
    setIsLoading(true) // Start loading

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/web.employees/${updatedEmployee.employee_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEmployee),
        }
      )

      if (!response.ok) {
        const errorMessage = await response.text() // Get error details
        console.error('Failed to update employee:', errorMessage)
        throw new Error(`Failed to update employee: ${errorMessage}`)
      }

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employee_id === updatedEmployee.employee_id
            ? updatedEmployee
            : emp
        )
      )

      setIsEditModalOpen(false) // Close the edit modal
      setUpdatedEmployee(null) // Clear updated employee data
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee)
    setUpdatedEmployee(employee) // Load selected employee data for editing
    setIsEditModalOpen(true) // Open the edit modal
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!updatedEmployee) return

    if (e.target.name === 'age') {
      setUpdatedEmployee({
        ...updatedEmployee,
        [e.target.name]: parseInt(e.target.value) || 0,
      })
    } else {
      setUpdatedEmployee({
        ...updatedEmployee,
        [e.target.name]: e.target.value,
      })
    }
  }

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // EDIT EMPLOYEE

  const handleNewEmployeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'age') {
      setNewEmployee({ ...newEmployee, age: parseInt(value) })
    } else {
      setNewEmployee({ ...newEmployee, [name]: value })
    }

    //  setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value })
  }

  const itemsPerPage = 7 // Change as needed

  // Calculate paginated data
  const indexOfLastEmployee = currentPage * itemsPerPage
  const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  )

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)

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
          placeholder='Search employees...'
          className='max-w-sm'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant='outline' onClick={() => setIsAddModalOpen(true)}>
          Add Employee
        </Button>
      </div>

      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>

              <TableHead>Age</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEmployees.map((employee) => (
              <TableRow key={employee.employee_id}>
                <TableCell>
                  {employee.first_name} {employee.middle_name}{' '}
                  {employee.last_name}
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.contact_number}</TableCell>
                <TableCell>{employee.address}</TableCell>
                <TableCell>{employee.age}</TableCell>

                <TableCell className='space-x-2'>
                  <Button
                    variant='outline'
                    onClick={() => handleEditClick(employee)} // Trigger edit modal
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

      {/* Add Employee Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6'>
            {[
              // Loop through existing fields
              'first_name',
              'middle_name',
              'last_name',
              'email',
              'contact_number',
              'address',
            ].map((field) => (
              <div key={field} className='sm:col-span-3'>
                <label htmlFor={field} className='block text-sm font-medium'>
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
                    value={newEmployee[field as keyof Employee] || ''}
                    onChange={handleNewEmployeeChange}
                  />
                </div>
              </div>
            ))}

            {/* Add Age Input Field */}
            <div className='sm:col-span-3'>
              <label htmlFor='age' className='block text-sm font-medium'>
                Age
              </label>
              <div className='mt-2'>
                <Input
                  type='number'
                  id='age'
                  name='age'
                  placeholder='Age'
                  value={newEmployee.age || ''}
                  onChange={(e) => handleNewEmployeeChange(e)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addEmployee}>Save</Button>
            <Button variant='outline' onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className='mt-10 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6'>
            {[
              'first_name',
              'middle_name',
              'last_name',
              'email',
              'age',
              'contact_number',
              'address',
            ].map((field) => (
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
                    value={updatedEmployee?.[field as keyof Employee] || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={updateEmployee}>Save</Button>
            <Button variant='outline' onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
