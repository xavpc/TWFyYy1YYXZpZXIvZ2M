import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceStatus } from '../enums/device-status.enum';

export class CreateDeviceDto {
  @ApiProperty({
    description: 'Vehicle plate number associated with the device',
    example: 'XYZ-5678',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Vehicle plate number is required' })
  vehicle_plate_num: string;

  @ApiProperty({
    description: 'Name of the device',
    example: 'Tablet X13',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Device name is required' })
  device_name: string;

  @ApiProperty({
    description: 'Current status of the device',
    enum: DeviceStatus,
    default: DeviceStatus.ACTIVE + "(NOT REQUIRED)",
    required: false,
  })
  @IsOptional()
  status?: DeviceStatus;

  @ApiProperty({
    description: 'Employee ID associated with the device (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUUID('4', { each: true })
  employee_id?: string;
}
