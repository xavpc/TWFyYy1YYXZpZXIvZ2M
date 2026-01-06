import { IsString, IsOptional, IsUUID, ArrayNotEmpty, IsArray } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  vehicle_plate_num: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayNotEmpty()
  employee_ids?: string[];
}