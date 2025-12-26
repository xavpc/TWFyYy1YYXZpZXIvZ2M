import { ApiProperty } from '@nestjs/swagger';
import { Device } from '../device.entity';

export class DeviceResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Device request successful' })
  message: string;

  @ApiProperty({ type: Device })
  data: Device;
}


export class DeviceListResponse {
    @ApiProperty({ example: true })
    success: boolean;
  
    @ApiProperty({ example: 'Devices retrieved successfully' })
    message: string;
  
    @ApiProperty({ type: [Device], description: 'List of devices' })
    data: Device[];
  
    @ApiProperty({ example: 5, description: 'Total number of devices' })
    total: number;
  }

  export class ErrorResponse {
    @ApiProperty({ example: false })
    success: boolean;
  
    @ApiProperty({ example: 'Device not found' })
    message: string;
  
    @ApiProperty({
      example: {
        code: 'NOT_FOUND',
        details: 'No device found with the specified ID',
      },
      required: false,
    })
    error?: Record<string, any>;
  }