import { ApiProperty } from '@nestjs/swagger';
import { CollectedPoints } from '@prisma/client';

export class CollectedPointResponse {
  @ApiProperty({
    description: 'The unique ID of the collected point',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  collected_point_id: string;

  @ApiProperty({
    description: 'The ID of the device that collected the point',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  device_id: string;

  @ApiProperty({
    description: 'The ID of the collection point',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  collection_point_id: string;

  @ApiProperty({
    description: 'Timestamp when the point was pushed to the server',
    example: '2024-02-10T12:00:00Z',
  })
  push_timestamp: Date;

  @ApiProperty({
    description: 'Timestamp when the point was collected by the device',
    example: '2024-02-10T11:55:00Z',
  })
  collected_timestamp: Date;

  @ApiProperty({
      description: 'The UUID of the device session',
      example: '123e4567-e89b-12d3-a456-426614174000',
  })
  session_id: string;

  constructor(collectedPoint: CollectedPoints) {
    this.collected_point_id = collectedPoint.collected_point_id;
    this.device_id = collectedPoint.device.device_id;
    this.session_id = collectedPoint.session.session_id;
    this.collection_point_id = collectedPoint.collection_point.collection_point_id;
    this.push_timestamp = collectedPoint.push_timestamp;
    this.collected_timestamp = collectedPoint.collected_timestamp;
  }
}

export class CollectedPointListResponse {
  @ApiProperty({
    description: 'List of collected points',
    type: [CollectedPointResponse],
  })
  data: CollectedPointResponse[];

  @ApiProperty({
    description: 'Total number of collected points',
    example: 5,
  })
  total: number;

  constructor(collectedPoints: CollectedPoints[]) {
    this.data = collectedPoints.map(
      (collectedPoint) => new CollectedPointResponse(collectedPoint),
    );
    this.total = collectedPoints.length;
  }
}

export class CollectedPointsErrorResponse {
  @ApiProperty({
    description: 'Error code',
    example: 'NOT_FOUND',
  })
  error_code: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Collected Point not found',
  })
  message: string;

  constructor(errorCode: string, message: string) {
    this.error_code = errorCode;
    this.message = message;
  }
}