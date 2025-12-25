'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Filter,
  Search,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Report {
  report_id: string
  route_name: string
  vehicle_plate_number: string
  employee_name: string
  remarks: string
  report_timestamp: string
  session_start_time: string
  session_end_time: string
}

interface FilterParams {
  route_name?: string
  vehicle_plate_number?: string
  employee_name?: string
  start_date?: string
  end_date?: string
  remarks_search?: string
  page: number
  limit: number
  sort_by: string
  sort_order: 'ASC' | 'DESC'
}

export default function ReportsTable() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [filterDialogOpen, setFilterDialogOpen] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [filters, setFilters] = useState<FilterParams>({
    page: 0,
    limit: 10,
    sort_by: 'report_timestamp',
    sort_order: 'DESC',
  })

  const [searchValue, setSearchValue] = useState<string>('')
  const [searchField, setSearchField] = useState<string>('employee_name')

  const [tempFilters, setTempFilters] = useState({
    route_name: '',
    vehicle_plate_number: '',
    employee_name: '',
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    remarks_search: '',
  })

  const columns = [
    { id: 'report_timestamp', label: 'Date and Time', sortable: true },
    { id: 'employee_name', label: 'Employee', sortable: true },
    { id: 'route_name', label: 'Route', sortable: true },
    { id: 'vehicle_plate_number', label: 'Vehicle', sortable: true },
    { id: 'session_start_time', label: ' Start', sortable: true },
    { id: 'session_end_time', label: ' End', sortable: true },
    { id: 'remarks', label: 'Remarks', sortable: false },
  ]

  useEffect(() => {
    fetchReports()
  }, [filters])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (key === 'page') {
            queryParams.append(key, (Number(value) + 1).toString())
          } else {
            queryParams.append(key, value.toString())
          }
        }
      })

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports?${queryParams.toString()}`
      )
      const data = await response.json()

      setReports(data.data || [])
      setTotalCount(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      setReports([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setFilters({
      ...filters,
      page: page - 1,
    })
  }

  const handleSortRequest = (columnId: string) => {
    const isAsc = filters.sort_by === columnId && filters.sort_order === 'ASC'
    setFilters({
      ...filters,
      sort_by: columnId,
      sort_order: isAsc ? 'DESC' : 'ASC',
      page: 0,
    })
    setCurrentPage(1)
  }

  const handleQuickSearch = () => {
    const newFilters = { ...filters, page: 0 }

    delete newFilters.employee_name
    delete newFilters.route_name
    delete newFilters.vehicle_plate_number
    delete newFilters.remarks_search

    if (searchValue) {
      if (searchField === 'employee_name')
        newFilters.employee_name = searchValue
      else if (searchField === 'route_name') newFilters.route_name = searchValue
      else if (searchField === 'vehicle_plate_number')
        newFilters.vehicle_plate_number = searchValue
      else if (searchField === 'remarks_search')
        newFilters.remarks_search = searchValue
    }

    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchValue('')
    setFilters({
      page: 0,
      limit: filters.limit,
      sort_by: 'report_timestamp',
      sort_order: 'DESC',
    })
    setCurrentPage(1)
  }

  const handleFilterApply = () => {
    const newFilters = { ...filters, page: 0 }

    if (tempFilters.route_name) newFilters.route_name = tempFilters.route_name
    else delete newFilters.route_name

    if (tempFilters.vehicle_plate_number)
      newFilters.vehicle_plate_number = tempFilters.vehicle_plate_number
    else delete newFilters.vehicle_plate_number

    if (tempFilters.employee_name)
      newFilters.employee_name = tempFilters.employee_name
    else delete newFilters.employee_name

    if (tempFilters.remarks_search)
      newFilters.remarks_search = tempFilters.remarks_search
    else delete newFilters.remarks_search

    if (tempFilters.start_date)
      newFilters.start_date = format(tempFilters.start_date, 'yyyy-MM-dd')
    else delete newFilters.start_date

    if (tempFilters.end_date)
      newFilters.end_date = format(tempFilters.end_date, 'yyyy-MM-dd')
    else delete newFilters.end_date

    setFilters(newFilters)
    setFilterDialogOpen(false)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setTempFilters({
      route_name: '',
      vehicle_plate_number: '',
      employee_name: '',
      start_date: undefined,
      end_date: undefined,
      remarks_search: '',
    })
  }

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr)
      return format(date, 'MMM d, yyyy h:mm a')
    } catch (error) {
      return dateTimeStr
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / (filters.limit || 10)))

  return (
    <div className='space-y-4'>
      {/* Search and Filter Controls */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div className='flex flex-col sm:flex-row w-full sm:w-auto gap-2'>
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className='w-[160px]'>
              <SelectValue placeholder='Search by...' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='employee_name'>Employee</SelectItem>
              <SelectItem value='route_name'>Route</SelectItem>
              <SelectItem value='vehicle_plate_number'>Vehicle</SelectItem>
              <SelectItem value='remarks_search'>Remarks</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex gap-2 w-full sm:w-auto'>
            <div className='relative w-full sm:w-[300px]'>
              <Input
                placeholder={`Search by ${searchField.replace('_', ' ')}...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                className='pr-8'
              />
              {searchValue && (
                <button
                  className='absolute right-2 top-2.5 text-gray-500 hover:text-gray-700'
                  onClick={handleClearSearch}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button onClick={handleQuickSearch} size='icon'>
              <Search size={18} />
            </Button>
          </div>
        </div>

        <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
          <DialogTrigger asChild>
            <Button variant='outline' className='flex gap-2'>
              <Filter size={16} />
              <span>Advanced Filters</span>
              {Object.keys(filters).length > 3 && (
                <span className='inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground'>
                  {Object.keys(filters).length - 3}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Advanced Filters</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label
                    htmlFor='employee_name'
                    className='text-sm font-medium'
                  >
                    Employee Name
                  </label>
                  <Input
                    id='employee_name'
                    value={tempFilters.employee_name}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        employee_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <label htmlFor='route_name' className='text-sm font-medium'>
                    Route Name
                  </label>
                  <Input
                    id='route_name'
                    value={tempFilters.route_name}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        route_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <label
                    htmlFor='vehicle_plate_number'
                    className='text-sm font-medium'
                  >
                    Vehicle Plate Number
                  </label>
                  <Input
                    id='vehicle_plate_number'
                    value={tempFilters.vehicle_plate_number}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        vehicle_plate_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <label
                    htmlFor='remarks_search'
                    className='text-sm font-medium'
                  >
                    Remarks Contains
                  </label>
                  <Input
                    id='remarks_search'
                    value={tempFilters.remarks_search}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        remarks_search: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !tempFilters.start_date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {tempFilters.start_date ? (
                          format(tempFilters.start_date, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={tempFilters.start_date}
                        onSelect={(date) =>
                          setTempFilters({ ...tempFilters, start_date: date })
                        }
                        initialFocus
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !tempFilters.end_date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {tempFilters.end_date ? (
                          format(tempFilters.end_date, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={tempFilters.end_date}
                        onSelect={(date) =>
                          setTempFilters({ ...tempFilters, end_date: date })
                        }
                        initialFocus
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={handleResetFilters}>
                Reset
              </Button>
              <Button onClick={handleFilterApply}>Apply Filters</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={column.sortable ? 'cursor-pointer' : ''}
                  onClick={() =>
                    column.sortable && handleSortRequest(column.id)
                  }
                >
                  <div className='flex items-center'>
                    {column.label}
                    {column.sortable && (
                      <ChevronDown
                        size={16}
                        className={`ml-1 transition-transform ${
                          filters.sort_by === column.id &&
                          filters.sort_order === 'ASC'
                            ? 'rotate-180'
                            : ''
                        } ${
                          filters.sort_by === column.id
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='text-center h-24'
                >
                  <div className='flex justify-center items-center h-full'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900'></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='text-center h-24'
                >
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.report_id} className='hover:bg-muted/50'>
                  <TableCell>
                    {formatDateTime(report.report_timestamp)}
                  </TableCell>
                  <TableCell>{report.employee_name}</TableCell>
                  <TableCell>{report.route_name}</TableCell>
                  <TableCell>{report.vehicle_plate_number}</TableCell>
                  <TableCell>
                    {formatDateTime(report.session_start_time)}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(report.session_end_time)}
                  </TableCell>
                  <TableCell className='max-w-[200px] truncate'>
                    {report.remarks}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          {/* Add safety checks to avoid undefined.length error */}
          Showing{' '}
          {reports && reports.length > 0
            ? (currentPage - 1) * (filters.limit || 10) + 1
            : 0}{' '}
          to {Math.min(currentPage * (filters.limit || 10), totalCount)} of{' '}
          {totalCount} entries
        </div>
        <div className='flex items-center space-x-2'>
          <Select
            value={String(filters.limit || 10)}
            onValueChange={(value) => {
              setFilters({ ...filters, limit: Number(value), page: 0 })
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='w-[70px]'>
              <SelectValue placeholder='10' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='5'>5</SelectItem>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='25'>25</SelectItem>
              <SelectItem value='50'>50</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex items-center space-x-1'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <span>«</span>
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span>‹</span>
            </Button>

            {/* Page numbers */}
            <div className='flex items-center'>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1
                // Only show current page, first, last, and 1 page before and after current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={i}
                      variant={
                        pageNumber === currentPage ? 'default' : 'outline'
                      }
                      size='icon'
                      onClick={() => handlePageChange(pageNumber)}
                      className='mx-0.5'
                    >
                      {pageNumber}
                    </Button>
                  )
                } else if (
                  (pageNumber === currentPage - 2 && currentPage > 3) ||
                  (pageNumber === currentPage + 2 &&
                    currentPage < totalPages - 2)
                ) {
                  return (
                    <span key={i} className='mx-1'>
                      ...
                    </span>
                  )
                }
                return null
              })}
            </div>

            <Button
              variant='outline'
              size='icon'
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span>›</span>
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <span>»</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
