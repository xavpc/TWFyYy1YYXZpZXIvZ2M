export interface Devices {
  device_id: string;
  device_name: string;
  employee: {
    employee_id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    address: string;
    contact_number: string;
    email: string;
    age: number;
  };
  vehicle_plate_num: string;
  status: string;
}
