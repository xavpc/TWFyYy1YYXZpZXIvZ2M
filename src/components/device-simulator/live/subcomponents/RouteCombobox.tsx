'use client'
import React from 'react'
import { DeviceRoute } from '@/types/device-route'
import { RouteIcon } from 'lucide-react'
import Combobox from '@/components/session-viewer/subcomponents/combobox'

interface RouteComboboxProps {
  routes: DeviceRoute[]
  routesLoading: boolean
  onSelectRoute: (route: DeviceRoute | null) => void
  selectedRoute: DeviceRoute | null
  disabled: boolean
}

const RouteCombobox: React.FC<RouteComboboxProps> = ({
  routes,
  routesLoading,
  onSelectRoute,
  selectedRoute,
  disabled
}) => {
  // Format route details with just the route name
  const enhancedRoutes = routes.map(route => ({
    ...route,
    displayName: route.route.route_name,
    routeInfo: `Route ID: ${route.route.route_id}`
  }))

  return (
    <Combobox
      items={enhancedRoutes}
      displayProperty="displayName"
      secondaryProperty="routeInfo"
      loading={routesLoading}
      onSelect={onSelectRoute}
      selectedItem={selectedRoute ? {
        ...selectedRoute,
        displayName: selectedRoute.route.route_name,
        routeInfo: `Route ID: ${selectedRoute.route.route_id}`
      } : null}
      placeholder={disabled ? "Select a device first" : "Select a route"}
      label="Route"
      icon={<RouteIcon size={16} />}
      statusProperty=""
    />
  )
}

export default RouteCombobox