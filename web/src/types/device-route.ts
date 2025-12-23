import { Route } from "./route";

export interface DeviceRoute {
  device_route_id: string;
  day_assigned: string;
  device: {
    device_id: string;
    device_name: string;
    vehicle_plate_num: string;
    status: string;
  };
  route: Route;
}