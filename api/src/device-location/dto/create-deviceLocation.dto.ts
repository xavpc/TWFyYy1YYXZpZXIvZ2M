import { IsNotEmpty, IsNumber, IsUUID, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceLocationDto {
  @ApiProperty({
    description: 'The latitude of the device location. It should be between -90 and 90.',
    example: 34.052235,
    minimum: -90,
    maximum: 90,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'The longitude of the device location. It should be between -180 and 180.',
    example: -118.243683,
    minimum: -180,
    maximum: 180,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'The UUID of the device associated with this location.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  device_id: string;

  @ApiProperty({
    description: 'Timestamp when the device location was recorded.',
    example: '2025-01-01T12:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  current_location_timestamp: string; 
}
