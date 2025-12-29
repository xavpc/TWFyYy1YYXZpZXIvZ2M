import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteCoordinatesDto {
  @ApiProperty({
    description: 'UUID of the associated route',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  route_id: string;

  @ApiProperty({
    description: 'Center Latitude of the route coordinate (range: -90 to 90)',
    example: 35.6895,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  center_latitude: number;

  @ApiProperty({
    description: 'Center Longitude of the route coordinate (range: -180 to 180)',
    example: 139.6917,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  center_longitude: number;

  @ApiProperty({
    description: 'Latitude of the route coordinate (range: -90 to 90)',
    example: 35.6895,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude of the route coordinate (range: -180 to 180)',
    example: 139.6917,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
