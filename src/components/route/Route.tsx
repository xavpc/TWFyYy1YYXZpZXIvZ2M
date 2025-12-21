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

import { Input } from '@/components/ui/input'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const Route = () => {
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
          placeholder='Search employees...'
          className='max-w-sm'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant='outline' onClick={() => console.log('clicked')}>
          Add Route
        </Button>
      </div>

      <div className='mt-2 border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route Name</TableHead>
              <TableHead>Action</TableHead>
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
                      console.log('Navigating to:', `/route/${route.route_id}`)
                      router.push(`/route/${route.route_id}`)
                    }}
                  >
                    View
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
          Previous
        </Button>
        <span className='text-sm'>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant='outline'
          disabled={currentPage >= totalPages} // ✅ Fixed edge case when `totalPages` is 0
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </>
  )
}

export default Route
