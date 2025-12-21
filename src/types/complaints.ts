export interface Complaint {
  complaint_id: string
  title: string
  description: string
  latitude: string
  longitude: string
  push_timestamp: string
  complaint_timestamp: string
  image: {
    image_id: string
    image_url: string
    file_name: string
    status: string
  }
  device: {
    device_id: string
    device_name: string
    vehicle_plate_num: string
    status: string
  }
}
