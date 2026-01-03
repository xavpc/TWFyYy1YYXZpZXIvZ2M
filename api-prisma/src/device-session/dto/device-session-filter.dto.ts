// Add this new DTO first
export class FilterDeviceSessionDto {
  // Basic filters
  session_id?: string;
  device_route_id?: string;
  device_id?: string;
  route_id?: string;
  employee_id?: string;
  
  // Date filters
  start_date?: Date;
  end_date?: Date;
  date?: Date; // Specific date
  
  // Status filters
  is_active?: boolean; // true = active sessions, false = ended sessions
  has_report?: boolean;
  
  // Time range filters
  started_after?: Date;
  started_before?: Date;
  ended_after?: Date;
  ended_before?: Date;
  
  // Device/Employee info filters
  device_name?: string;
  vehicle_plate_num?: string;
  employee_name?: string;
  employee_email?: string;
  route_name?: string;
  
  // Global search
  search?: string;
  
  // Pagination & Sorting
  page?: number = 1;
  limit?: number = 10;
  sort_by?: string = 'start';
  sort_order?: 'ASC' | 'DESC' = 'DESC';
}