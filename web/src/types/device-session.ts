export interface DeviceSession {
    session_id: string;
    start: string;
    end: string | null;
    device_route: {
      device_route_id: string;
      day_assigned: string;
      device: {
        device_id: string;
        device_name: string;
        vehicle_plate_num: string;
        status: string;
      };
      route: {
        route_id: string;
        route_name: string;
        center_latitude: string;
        center_longitude: string;
      };
    };
  }