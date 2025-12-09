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

// EMPLOYEES API
import { Employee } from '@/types/employees'

export default function EmployeeList() {
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
              {/* <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead> */}

              <TableHead>Age</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.employee_id}>
                <TableCell>
                  {employee.first_name} {employee.middle_name}{' '}
                  {employee.last_name}
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.contact_number}</TableCell>
                <TableCell>{employee.address}</TableCell>
                <TableCell>{employee.age}</TableCell>
                {/* <TableCell>{employee.role}</TableCell>
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
                </TableCell> */}
                <TableCell>
                  <Button
                    variant='outline'
                    onClick={() => handleEditClick(employee)} // Trigger edit modal
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
            <Button onClick={handleAddEmployee}>Save</Button>
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
            <Button onClick={handleSave}>Save</Button>
            <Button variant='outline' onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
