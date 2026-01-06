import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  vehicle_plate_num: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  @IsUUID('4', { each: true })
  employee_ids?: string;
}