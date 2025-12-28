import { IsString, IsNotEmpty, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCollectionPointsDto {
  @ApiProperty({
    description: 'Name of the collection point',
    example: 'Downtown Collection Point',
  })
  @IsNotEmpty()
  @IsString()
  collection_point_name: string;

  @ApiProperty({
    description: 'Latitude coordinate of the collection point',
    example: 40.712776,
    minimum: -90,
    maximum: 90,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of the collection point',
    example: -74.005974,
    minimum: -180,
    maximum: 180,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'The UUID of the associated route',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  route_id: string;
}
