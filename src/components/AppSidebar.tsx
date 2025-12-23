'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl' // Import useTranslations
import {
  Smartphone,
  LayoutDashboard,
  MousePointer2,
  Users,
  ChevronUp,
  User2,
  NotebookText,
  PlaySquare,
  Navigation,
  Satellite,
  Activity,
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
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import LanguageSwitcher from './LanguageSwitcher'

import { logout } from '@/lib/auth'
import { ModeButton } from './ModeButton'

// Menu items.
export function AppSidebar() {
  const pathname = usePathname()
  const t = useTranslations('Sidebar') // Ensure translations work

  if (pathname === '/login') return null

  const items = [
    {
      title: t('Dashboard'),
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('Employees'),
      url: '/employees',
      icon: Users,
    },
    {
      title: t('Device'),
      url: '/device',
      icon: Smartphone,
    },
    {
      title: t('Route'),
      url: '/route',
      icon: MousePointer2,
    },
    {
      title: t('Complaints'),
      url: '/complaints',
      icon: NotebookText,
    },

    {
      title: t('Device Simulator'),
      url: '/device-simulator',
      icon: PlaySquare,
    },
    {
      title: t('Archived Sessions'),
      url: '/view-sessions',
      icon: Satellite,
    },
    {
      title: t('Live Sessions'),
      url: '/view-sessions-active',
      icon: Activity,
    },
  ]

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className='flex w-full items-center justify-between'>
                <span>{t('Title')}</span>
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className='mt-5'>
                {items.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={`flex items-center gap-2 text-lg px-3 py-2 rounded-md ${
                            isActive ? 'bg-gray-200 dark:bg-zinc-800' : ''
                          }`}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className='flex justify-between mb-2'>
                <ModeButton />
                <LanguageSwitcher />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> {t('Username')}
                    <ChevronUp className='ml-auto' />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side='top'
                  className='w-[--radix-popper-anchor-width]'
                >
                  <DropdownMenuItem>
                    <button
                      onClick={logout}
                      className='bg-red-500 text-white px-4 py-2'
                    >
                      {t('SignOut')}
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
