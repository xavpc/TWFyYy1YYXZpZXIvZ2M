import { ApiProperty } from '@nestjs/swagger';
import { DeviceLocation } from '../device-location.entity';


export class DeviceLocationResponse {
  @ApiProperty({
    description: 'The unique ID of the device location',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  device_location_id: string;

  @ApiProperty({
    description: 'The latitude of the device location',
    example: 34.052235,
  })
  latitude: number;

  @ApiProperty({
    description: 'The longitude of the device location',
    example: -118.243683,
  })
  longitude: number;

  @ApiProperty({
    description: 'The timestamp when the device location was recorded',
    example: '2025-01-30T12:00:00Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'The sequence number of the device location entry',
    example: 1,
  })
  sequence: number;

  @ApiProperty({
    description: 'The device associated with this device location',
    type: String, // Or map it directly to a device DTO if required
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  device_id: string;

  constructor(deviceLocation: DeviceLocation) {
    this.device_location_id = deviceLocation.device_location_id;
    this.latitude = deviceLocation.latitude;
    this.longitude = deviceLocation.longitude;
    this.timestamp = deviceLocation.timestamp;
    this.sequence = deviceLocation.sequence;
    this.device_id = deviceLocation.device.device_id; // Assuming a device object is linked here
  }
}


export class DeviceLocationListResponse {
  @ApiProperty({
    description: 'List of device locations',
    type: [DeviceLocationResponse],
  })
  data: DeviceLocationResponse[];

  @ApiProperty({
    description: 'Total number of device locations available',
    example: 5,
  })
  total: number;

  constructor(deviceLocations: DeviceLocation[]) {
    this.data = deviceLocations.map(
      (deviceLocation) => new DeviceLocationResponse(deviceLocation),
    );
    this.total = deviceLocations.length;
  }
}


export class ErrorResponse {
  @ApiProperty({
    description: 'Error code',
    example: 'NOT_FOUND',
  })
  error_code: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Device Location not found',
  })
  message: string;

  constructor(errorCode: string, message: string) {
    this.error_code = errorCode;
    this.message = message;
  }
}
