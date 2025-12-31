import { ApiProperty } from '@nestjs/swagger';
import { CollectionPoints } from '../collection-points.entity';

export class CollectionPointResponse {
  @ApiProperty({
    description: 'The unique ID of the collection point',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  collection_point_id: string;

  @ApiProperty({
    description: 'Name of the collection point',
    example: 'Downtown Collection Point',
  })
  collection_point_name: string;

  @ApiProperty({
    description: 'Latitude coordinate of the collection point',
    example: 40.712776,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of the collection point',
    example: -74.005974,
  })
  longitude: number;

  @ApiProperty({
    description: 'The route ID associated with this collection point',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  route_id: string;

  constructor(collectionPoint: CollectionPoints) {
    this.collection_point_id = collectionPoint.collection_point_id;
    this.collection_point_name = collectionPoint.collection_point_name;
    this.latitude = collectionPoint.latitude;
    this.longitude = collectionPoint.longitude;
    this.route_id = collectionPoint.route.route_id;
  }
}

export class CollectionPointListResponse {
  @ApiProperty({
    description: 'List of collection points',
    type: [CollectionPointResponse],
  })
  data: CollectionPointResponse[];

  @ApiProperty({
    description: 'Total number of collection points',
    example: 5,
  })
  total: number;

  constructor(collectionPoints: CollectionPoints[]) {
    this.data = collectionPoints.map(
      (collectionPoint) => new CollectionPointResponse(collectionPoint),
    );
    this.total = collectionPoints.length;
  }
}

export class CollectionPointsErrorResponse {
  @ApiProperty({
    description: 'Error code',
    example: 'NOT_FOUND',
  })
  error_code: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Collection Point not found',
  })
  message: string;

  constructor(errorCode: string, message: string) {
    this.error_code = errorCode;
    this.message = message;
  }
}