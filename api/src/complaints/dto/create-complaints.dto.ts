import { IsString, IsNumber, IsUUID, IsLatitude, IsLongitude } from 'class-validator';
//TODO: improve dto
export class CreateComplaintDto {
  @IsUUID()
  image_id: string;

  @IsUUID()
  device_id: string;

  @IsString()
  description: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}