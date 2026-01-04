import { ApiProperty, PartialType } from '@nestjs/swagger';
import { DeviceSession } from '../device-session.entity';

export class BaseSessionResponse {
  @ApiProperty({ example: true })
  success: boolean;
  
  @ApiProperty({ example: 'Device session request successful' })
  message: string;
}

// Single session response
export class DeviceSessionResponse extends BaseSessionResponse {
  @ApiProperty({ type: DeviceSession })
  data: DeviceSession;
}

// Multiple sessions response
export class DeviceSessionsArrayResponse extends BaseSessionResponse {
  @ApiProperty({ type: [DeviceSession] })
  data: DeviceSession[];
}



// export class DeviceSessionListResponse {
//   @ApiProperty({ example: true })
//   success: boolean;

//   @ApiProperty({ example: 'Device sessions retrieved successfully' })
//   message: string;

//   @ApiProperty({ type: [DeviceSession], description: 'List of device sessions' })
//   data: DeviceSession[];

//   @ApiProperty({ example: 5, description: 'Total number of sessions' })
//   total: number;
// }

export class DeviceSessionListResponse {
  success: boolean;
  message: string;
  data: DeviceSession[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export class DeviceSessionErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Device session not found' })
  message: string;

  @ApiProperty({
    example: {
      code: 'NOT_FOUND',
      details: 'No device session found with the specified ID',
    },
    required: false,
  })
  error?: Record<string, any>;
}