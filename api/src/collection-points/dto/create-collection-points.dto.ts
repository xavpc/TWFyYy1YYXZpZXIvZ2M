import { IsString, IsNotEmpty, IsNumber, IsUUID, Min, Max } from 'class-validator';

export class CreateCollectionPointsDto {
  @IsNotEmpty()
  @IsString()
  collection_point_name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNotEmpty()
  @IsUUID()
  route_id: string;
}