'use client'

import dynamic from 'next/dynamic'

const OSMMap = dynamic(() => import('@/components/OSM/OSMMap'), { ssr: false })

export default function MapPage() {
  return (
    <div className='container mx-auto p-4'>
      <OSMMap />
    </div>
  )
}
