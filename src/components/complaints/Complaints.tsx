// components/complaints/ComplaintsList.tsx
'use client'

import { useState } from 'react'
import { Complaint, mockComplaints } from '@/types/complaints'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MapPin, Calendar, User } from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const categoryLabels = {
  wrong_disposal: 'Wrong Disposal',
  missed_collection: 'Missed Collection',
  illegal_dumping: 'Illegal Dumping',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
}

export default function ComplaintsList() {
  const [complaints] = useState<Complaint[]>(mockComplaints)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  )
  const [filter, setFilter] = useState<string>('all')

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {/* Complaints List */}
      <div className='space-y-4'>
        <div className='flex gap-4 mb-6'>
          <Input placeholder='Search complaints...' className='flex-1' />
          <Select defaultValue='all' onValueChange={setFilter}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='in_progress'>In Progress</SelectItem>
              <SelectItem value='resolved'>Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-4'>
          {complaints.map((complaint) => (
            <Card
              key={complaint.id}
              className={`p-4 cursor-pointer transition-colors  ${
                selectedComplaint?.id === complaint.id
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
              onClick={() => setSelectedComplaint(complaint)}
            >
              <div className='flex gap-4'>
                <div className='relative w-24 h-24 rounded-lg overflow-hidden'>
                  <Image
                    src={complaint.image}
                    alt='Complaint evidence'
                    fill
                    className='object-cover'
                  />
                </div>
                <div className='flex-1'>
                  <div className='flex justify-between items-start mb-2'>
                    <Badge variant='outline'>
                      {categoryLabels[complaint.category]}
                    </Badge>
                    <Badge className={statusColors[complaint.status]}>
                      {complaint.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className='text-sm mb-2'>{complaint.message}</p>
                  <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <MapPin size={14} />
                      <span className='truncate'>
                        {complaint.location.address}
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Calendar size={14} />
                      <span>
                        {new Date(complaint.reportedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail View */}
      <div className='h-[calc(100vh-10rem)] sticky top-6'>
        {selectedComplaint ? (
          <Card className='h-full'>
            <div className='h-full flex flex-col'>
              {/* Image */}
              <div className='relative w-full h-64'>
                <Image
                  src={selectedComplaint.image}
                  alt='Complaint evidence'
                  fill
                  className='object-cover'
                />
              </div>

              {/* Details */}
              <div className='p-6 flex-1'>
                <div className='flex justify-between items-start mb-4'>
                  <Badge variant='outline' className='text-lg'>
                    {categoryLabels[selectedComplaint.category]}
                  </Badge>
                  <Badge
                    className={`${
                      statusColors[selectedComplaint.status]
                    } text-lg`}
                  >
                    {selectedComplaint.status.replace('_', ' ')}
                  </Badge>
                </div>

                <p className='mb-4'>{selectedComplaint.message}</p>

                <div className='space-y-2 mb-4'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='text-muted-foreground' />
                    <span>{selectedComplaint.location.address}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='text-muted-foreground' />
                    <span>
                      {new Date(selectedComplaint.reportedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground' />
                    <span>Reported by {selectedComplaint.reportedBy}</span>
                  </div>
                </div>

                <div className='mt-4 space-x-2'>
                  <Button variant='outline'>Mark as In Progress</Button>
                  <Button>Mark as Resolved</Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className='h-full flex items-center justify-center text-muted-foreground'>
            Select a complaint to view details
          </Card>
        )}
      </div>
    </div>
  )
}
