import { ApiProperty } from '@nestjs/swagger';
import { Complaints } from '../complaints.entity';

class ImageResponse {
  @ApiProperty({
    description: 'Unique identifier of the image',
    example: '76ef3dc7-becf-4b40-b9e7-fdd2b7cf66b6'
  })
  image_id: string;

  @ApiProperty({
    description: 'URL of the image',
    example: 'https://res.cloudinary.com/dzlzm64uw/image/upload/v1739186762/route-images/awgzvos6lckphidvmw3k.jpg'
  })
  image_url: string;

  @ApiProperty({
    description: 'Filename of the image',
    example: 'Garbagehope-637x417.jpg'
  })
  file_name: string;

  @ApiProperty({
    description: 'Status of the image',
    example: 'active'
  })
  status: string;
}

class DeviceResponse {
  @ApiProperty({
    description: 'Unique identifier of the device',
    example: '80dd42a9-e1e1-11ef-9da2-54ee75718d0f'
  })
  device_id: string;

  @ApiProperty({
    description: 'Name of the device',
    example: 'デバイス・サクラ (Device Sakura)'
  })
  device_name: string;

  @ApiProperty({
    description: 'Vehicle plate number',
    example: '桜-321'
  })
  vehicle_plate_num: string;

  @ApiProperty({
    description: 'Status of the device',
    example: 'active'
  })
  status: string;
}

export class ComplaintResponse {
  @ApiProperty({
    description: 'Unique identifier of the complaint',
    example: 'f741a36d-e59d-4de2-ac89-26cb4a277b0c'
  })
  complaint_id: string;

  @ApiProperty({
    description: 'Title of the complaint',
    example: 'Trash not thrown correctly'
  })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the complaint',
    example: 'Trash not thrown on their respective collection point'
  })
  description: string;

  @ApiProperty({
    description: 'Latitude coordinate of complaint location',
    example: '40.712776'
  })
  latitude: string;

  @ApiProperty({
    description: 'Longitude coordinate of complaint location',
    example: '-74.005974'
  })
  longitude: string;

  @ApiProperty({
    description: 'Timestamp when the complaint was pushed',
    example: '2025-02-10T13:24:00.933Z'
  })
  push_timestamp: string;

  @ApiProperty({
    description: 'Timestamp of when the complaint occurred',
    example: '2023-06-15T10:30:00.000Z'
  })
  complaint_timestamp: string;

  @ApiProperty({
    description: 'Image associated with the complaint',
    type: ImageResponse
  })
  image: ImageResponse;

  @ApiProperty({
    description: 'Device associated with the complaint',
    type: DeviceResponse
  })
  device: DeviceResponse;

  constructor(complaint: Complaints) {
    this.complaint_id = complaint.complaint_id;
    this.title = complaint.title;
    this.description = complaint.description;
    this.latitude = complaint.latitude.toString();
    this.longitude = complaint.longitude.toString();
    this.push_timestamp = complaint.push_timestamp.toISOString();
    this.complaint_timestamp = complaint.complaint_timestamp.toISOString();
    this.image = {
      image_id: complaint.image.image_id,
      image_url: complaint.image.image_url,
      file_name: complaint.image.file_name,
      status: complaint.image.status
    };
    this.device = {
      device_id: complaint.device.device_id,
      device_name: complaint.device.device_name,
      vehicle_plate_num: complaint.device.vehicle_plate_num,
      status: complaint.device.status
    };
  }
}

export class ComplaintListResponse {
  @ApiProperty({
    description: 'List of complaints',
    type: [ComplaintResponse]
  })
  data: ComplaintResponse[];

  @ApiProperty({
    description: 'Total number of complaints',
    example: 5
  })
  total: number;

  constructor(complaints: Complaints[]) {
    this.data = complaints.map(complaint => new ComplaintResponse(complaint));
    this.total = complaints.length;
  }
}

export class ComplaintsErrorResponse {
  @ApiProperty({
    description: 'Error code',
    example: 'NOT_FOUND'
  })
  error_code: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Complaint not found'
  })
  message: string;

  constructor(errorCode: string, message: string) {
    this.error_code = errorCode;
    this.message = message;
  }
}