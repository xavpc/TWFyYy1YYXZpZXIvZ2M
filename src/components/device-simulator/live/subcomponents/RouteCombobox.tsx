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
  // Format route details with unique identification
  const enhancedRoutes = routes.map(route => ({
    ...route,
    displayName: route.route.route_name,
    routeInfo: `Day Assigned: ${route.day_assigned}`,
    uniqueKey: route.device_route_id // Add unique identifier
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
        routeInfo: `Day Assigned: ${selectedRoute.day_assigned}`,
        uniqueKey: selectedRoute.device_route_id // Use unique identifier for selection
      } : null}
      placeholder={disabled ? "Select a device first" : "Select a route"}
      label="Route"
      icon={<RouteIcon size={16} />}
      statusProperty=""
      disabled={disabled}
    />
  )
}

export default RouteCombobox