// types/complaint.ts
export interface Complaint {
  id: string
  image: string
  message: string
  location: {
    lat: number
    lng: number
    address: string
  }
  category: 'wrong_disposal' | 'missed_collection' | 'illegal_dumping'
  status: 'pending' | 'in_progress' | 'resolved'
  reportedAt: string
  reportedBy: string
}

export const mockComplaints: Complaint[] = [
  {
    id: '1',
    image: '/images/complaints/complaint1.png',
    message: 'Non-biodegradable waste found in biodegradable bin',
    location: {
      lat: 51.505,
      lng: -0.09,
      address: '123 Green Street, London',
    },
    category: 'wrong_disposal',
    status: 'pending',
    reportedAt: '2024-01-19T10:30:00Z',
    reportedBy: 'John Doe',
  },
  {
    id: '2',
    image: '/images/complaints/complaint2.png',
    message: 'Trash not collected at scheduled time',
    location: {
      lat: 51.51,
      lng: -0.1,
      address: '456 Park Road, London',
    },
    category: 'missed_collection',
    status: 'in_progress',
    reportedAt: '2024-01-18T15:45:00Z',
    reportedBy: 'Jane Smith',
  },
]
