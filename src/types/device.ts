import { Employee } from "./employees"

export interface Device {
    device_id: string
    device_name: string
    vehicle_plate_num: string
    status: string
    employee: Employee
  }