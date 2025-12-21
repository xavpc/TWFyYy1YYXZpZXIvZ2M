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
        ` ${process.env.NEXT_PUBLIC_API_URL}/mobile.complaints`
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
   
  )
}
