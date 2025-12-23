'use client'

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'

export function FloatingTrigger() {
  const { state } = useSidebar()
  
  return state === "collapsed" ? (
    <div className="fixed top-4 left-4 z-50 opacity-40 hover:opacity-100 transition-opacity">
      <SidebarTrigger />
    </div>
  ) : null
}