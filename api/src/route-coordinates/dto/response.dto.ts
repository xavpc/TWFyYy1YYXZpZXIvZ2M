import { ApiProperty } from '@nestjs/swagger';
import { RouteCoordinates } from '../route-coordinates.entity';
import { Route } from 'src/route/route.entity';

export class RouteCoordinatesResponse {
  @ApiProperty({
    description: 'The unique ID of the route coordinates',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  route_coordinates_id: string;



  @ApiProperty({
    description: 'The latitude of the route coordinates',
    example: 35.6895,
  })
  latitude: number;

  @ApiProperty({
    description: 'The longitude of the route coordinates',
    example: 139.6917,
  })
  longitude: number;

  @ApiProperty({
    description: 'A unique sequence number for the route coordinates, to know the precedence of points',
    example: 1,
  })
  sequence: number;

  @ApiProperty({
    description: 'The route associated with these coordinates',
    type: () => Route, // Use a DTO for Route if available
    example: {
      route_id: 'e5a53ba6-deda-11ef-9da2-54ee75718d0f',
      route_name: 'Route D',
    },
  })
  route: Route;



  constructor(routeCoordinates: RouteCoordinates) {
    this.route_coordinates_id = routeCoordinates.route_coordinates_id;
    this.latitude = routeCoordinates.latitude;
    this.longitude = routeCoordinates.longitude;
    this.sequence = routeCoordinates.sequence;
    this.route = routeCoordinates.route; // Assuming the route object is linked here
  }
}

export class RouteCoordinatesListResponse {
  @ApiProperty({
    description: 'List of route coordinates',
    type: [RouteCoordinatesResponse],
  })
  data: RouteCoordinatesResponse[];

  @ApiProperty({
    description: 'Total number of route coordinates available',
    example: 5,
  })
  total: number;

  constructor(routeCoordinates: RouteCoordinates[]) {
    this.data = routeCoordinates.map(
      (coord) => new RouteCoordinatesResponse(coord),
    );
    this.total = routeCoordinates.length;
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
    example: 'Route Coordinates not found',
  })
  message: string;

  constructor(errorCode: string, message: string) {
    this.error_code = errorCode;
    this.message = message;
  }
}