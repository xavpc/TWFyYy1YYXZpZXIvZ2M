'use client' // Marks this as a client component

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Employee } from '@/types/employees'

export default function EmployeeList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/web.employees`)
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.data) // Assuming data.data contains the employee list
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        // You can handle errors if needed
      })
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <Input
          placeholder='Search employees...'
          className='max-w-sm'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.employee_id}>
                <TableCell>{employee.first_name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.contact_number}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      employee.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(employee.joinDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
