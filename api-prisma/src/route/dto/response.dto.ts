import { ApiProperty } from '@nestjs/swagger';
import { Route } from '@prisma/client';

export class RouteResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Route request successful' })
  message: string;

  @ApiProperty({ type: 'object' })
  data: Route;
}

export class RouteListResponse {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Routes retrieved successfully' })
  message: string;

  @ApiProperty({ type: 'array', items: { type: 'object' }, description: 'List of routes' })
  data: Route[];

  @ApiProperty({ example: 5, description: 'Total number of routes' })
  total: number;
}

export class RouteErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Route not found' })
  message: string;

  @ApiProperty({
    example: {
      code: 'NOT_FOUND',
      details: 'No route found with the specified ID',
    },
    required: false,
  })
  error?: Record<string, any>;
}
