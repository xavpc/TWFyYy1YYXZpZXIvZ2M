'use client'

import { useState, useEffect } from 'react'
import { Complaint } from '@/types/complaints'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Calendar } from 'lucide-react'
import Image from 'next/image'

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  )

  // Fetch complaints from API
  async function fetchComplaints() {
    try {
      const response = await fetch(
        ` ${process.env.NEXT_PUBLIC_API_URL}/complaints`
      ) // Adjust the endpoint as needed
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch complaints')
      }

      if (!Array.isArray(result.data)) {
        throw new Error('Unexpected API response format')
      }

      setComplaints(result.data) // Ensure only the `data` array is set
    } catch (error) {
      console.error('Error fetching complaints:', error)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {/* Complaints List */}
      <div className='space-y-4'>
        <Input placeholder='Search complaints...' className='mb-4' />

        {complaints.length === 0 ? (
          <p className='text-center text-muted-foreground'>
            No complaints found.
          </p>
        ) : (
          complaints.map((complaint) => (
            <Card
              key={complaint.complaint_id}
              className={`p-4 cursor-pointer transition-colors ${
                selectedComplaint?.complaint_id === complaint.complaint_id
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
              onClick={() => setSelectedComplaint(complaint)}
            >
              <div className='flex gap-4'>
                {/* Complaint Image */}
                <div className='relative w-24 h-24 rounded-lg overflow-hidden'>
                  <Image
                    src={complaint.image.image_url}
                    alt='Complaint evidence'
                    fill
                    className='object-cover'
                  />
                </div>

                <div className='flex-1'>
                  {/* Title */}
                  <h3 className='font-semibold mb-1'>{complaint.title}</h3>

                  {/* Description */}
                  <p className='text-sm mb-2'>{complaint.description}</p>

                  {/* Location & Timestamp */}
                  <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <MapPin size={14} />
                      <span>
                        Lat: {complaint.latitude}, Lng: {complaint.longitude}
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Calendar size={14} />
                      <span>
                        {new Date(
                          complaint.complaint_timestamp
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detail View */}
      <div className='h-[calc(100vh-10rem)] sticky top-6'>
        {selectedComplaint ? (
          <Card className='h-full'>
            <div className='h-full flex flex-col'>
              {/* Image */}
              <div className='relative w-full h-64'>
                <Image
                  src={selectedComplaint.image.image_url}
                  alt='Complaint evidence'
                  fill
                  className='object-cover'
                />
              </div>

              {/* Details */}
              <div className='p-6 flex-1'>
                <h2 className='text-xl font-semibold mb-2'>
                  {selectedComplaint.title}
                </h2>
                <p className='mb-4'>{selectedComplaint.description}</p>

                <div className='space-y-2 mb-4'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='text-muted-foreground' />
                    <span>
                      Lat: {selectedComplaint.latitude}, Lng:{' '}
                      {selectedComplaint.longitude}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='text-muted-foreground' />
                    <span>
                      {new Date(
                        selectedComplaint.complaint_timestamp
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className='mt-4 space-x-2'>
                  <Button variant='outline'>Mark as in Progress</Button>
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
