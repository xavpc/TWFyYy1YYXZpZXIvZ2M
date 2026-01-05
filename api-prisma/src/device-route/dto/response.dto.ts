import { ApiProperty } from '@nestjs/swagger';
import { DeviceRoute } from '@prisma/client';
import { DeviceRouteDay } from '../enums/device-route-day.enum';

export class DeviceRouteResponse {
  @ApiProperty({
    description: 'The unique ID of the device route',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  device_route_id: string;

  @ApiProperty({
    description: 'The device ID associated with this route',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  device_id: string;

  @ApiProperty({
    description: 'The route ID associated with this device',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  route_id: string;

  @ApiProperty({
    description: 'Day when the route is assigned to the device',
    enum: DeviceRouteDay,
    example: DeviceRouteDay.MONDAY,
  })
  day_assigned: DeviceRouteDay;

  constructor(deviceRoute: DeviceRoute) {
    this.device_route_id = deviceRoute.device_route_id;
    this.device_id = deviceRoute.device_id;
    this.route_id = deviceRoute.route_id;
    this.day_assigned = deviceRoute.day_assigned;
  }
}

export class DeviceRouteListResponse {
  @ApiProperty({
    description: 'List of device routes',
    type: [DeviceRouteResponse],
  })
  data: DeviceRouteResponse[];

  @ApiProperty({
    description: 'Total number of device routes available',
    example: 5,
  })
  total: number;

  constructor(deviceRoutes: DeviceRoute[]) {
    this.data = deviceRoutes.map(
      (deviceRoute) => new DeviceRouteResponse(deviceRoute),
    );
    this.total = deviceRoutes.length;
  }
}

export class DeviceRouteErrorResponse {
  @ApiProperty({
    description: 'Error code',
    example: 'NOT_FOUND',
  })
  error_code: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Device Route not found',
  })
  message: string;

  constructor(errorCode: string, message: string) {
    this.error_code = errorCode;
    this.message = message;
  }
}
