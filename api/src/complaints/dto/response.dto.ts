import { ApiProperty } from '@nestjs/swagger';
import { Complaints } from '../complaints.entity';

export class ComplaintResponse {
  @ApiProperty({
    description: 'Unique complaint ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  complaint_id: string;

  @ApiProperty({
    description: 'Associated image ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  image_id: string;

  @ApiProperty({
    description: 'Associated device ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  device_id: string;

  @ApiProperty({
    description: 'Complaint title',
    example: 'Trash not thrown correctly'
  })
  title: string;

  @ApiProperty({
    description: 'Detailed complaint description',
    example: 'Trash not thrown on their respective collection point'
  })
  description: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 40.712776
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -74.005974
  })
  longitude: number;

  @ApiProperty({
    description: 'Timestamp when complaint was pushed to system',
    example: '2023-06-15T10:30:00Z'
  })
  push_timestamp: Date;

  @ApiProperty({
    description: 'Timestamp when complaint actually occurred',
    example: '2023-06-15T10:30:00Z'
  })
  complaint_timestamp: Date;

  constructor(complaint: Complaints) {
    this.complaint_id = complaint.complaint_id;
    this.image_id = complaint.image?.image_id;
    this.device_id = complaint.device?.device_id;
    this.title = complaint.title;
    this.description = complaint.description;
    this.latitude = complaint.latitude;
    this.longitude = complaint.longitude;
    this.push_timestamp = complaint.push_timestamp;
    this.complaint_timestamp = complaint.complaint_timestamp;
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

export class ErrorResponse {
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