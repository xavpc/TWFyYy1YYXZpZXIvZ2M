'use client'
import React from 'react'
import { Device } from '@/types/device'
import { TabletIcon } from 'lucide-react'
import Combobox from '@/components/session-viewer/subcomponents/combobox'

interface DeviceComboboxProps {
  devices: Device[]
  devicesLoading: boolean
  onSelectDevice: (device: Device | null) => void
  selectedDevice: Device | null
  disabled?: boolean
}

const DeviceCombobox: React.FC<DeviceComboboxProps> = ({
  devices,
  devicesLoading,
  onSelectDevice,
  selectedDevice,
  disabled
}) => {
  // Format device display name to include vehicle plate
  const formatDeviceName = (device: Device) => {
    return `${device.device_name} (${device.vehicle_plate_num})`
  }

  // Format employee name
  const formatEmployeeName = (device: Device) => {
    return `Operator: ${device.employee.first_name} ${device.employee.last_name}`
  }

  // Update the devices array with formatted display properties
  const enhancedDevices = devices.map(device => ({
    ...device,
    displayName: formatDeviceName(device),
    employeeInfo: formatEmployeeName(device)
  }))

  return (
    <Combobox
      items={enhancedDevices}
      displayProperty="displayName"
      secondaryProperty="employeeInfo"
      loading={devicesLoading}
      onSelect={onSelectDevice}
      selectedItem={selectedDevice ? {
        ...selectedDevice,
        displayName: formatDeviceName(selectedDevice),
        employeeInfo: formatEmployeeName(selectedDevice)
      } : null}
      placeholder="Select a device"
      label="Device"
      icon={<TabletIcon size={16} />}
      statusProperty="status"
      disabled={disabled}
    />
  )
}

export default DeviceCombobox