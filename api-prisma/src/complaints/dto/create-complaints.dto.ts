import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsLatitude, IsLongitude, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateComplaintDto {
  @ApiProperty({
    description: 'UUID of the associated image',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true
  })
  @IsUUID()
  @IsNotEmpty()
  image_id: string;

  @ApiProperty({
    description: 'UUID of the associated device',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true
  })
  @IsUUID()
  @IsNotEmpty()
  device_id: string;

  @ApiProperty({
    description: 'Title of the complaint (unique)',
    example: 'Trash not thrown correctly',
    maxLength: 255,
    required: true
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the complaint (unique)',
    example: 'Trash not thrown on their respective collection point',
    maxLength: 1000,
    required: true
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Latitude coordinate of complaint location',
    example: 40.712776,
    minimum: -90,
    maximum: 90
  })
  @IsLatitude()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of complaint location',
    example: -74.005974,
    minimum: -180,
    maximum: 180
  })
  @IsLongitude()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    description: 'Timestamp of when the complaint occurred',
    example: '2023-06-15T10:30:00Z',
    required: true
  })
  @IsDateString()
  @IsNotEmpty()
  complaint_timestamp: string;
}
