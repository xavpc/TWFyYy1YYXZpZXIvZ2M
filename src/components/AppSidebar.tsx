import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Smartphone,
  LayoutDashboard,
  CircleUserRound,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

// Menu items.
const items = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Employees',
    url: '/',
    icon: CircleUserRound,
  },
  {
    title: 'Device',
    url: '/',
    icon: Smartphone,
  },
  {
    title: 'Calendar',
    url: '/',
    icon: Calendar,
  },
  {
    title: 'Search',
    url: '/',
    icon: Search,
  },
  {
    title: 'Settings',
    url: '/',
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Garbage Collection System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='mt-5'>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
