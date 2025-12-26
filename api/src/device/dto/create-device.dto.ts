import { IsString, IsOptional, IsUUID, IsNotEmpty, isNotEmpty } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty({ message: 'Vehicle plate number is required' })
  vehicle_plate_num: string;

  @IsString()
  @IsNotEmpty({ message: 'Device name is required' })
  device_name : string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  @IsUUID('4', { each: true })
  employee_id?: string;
}