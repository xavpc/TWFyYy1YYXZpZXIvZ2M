import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceStatus } from '../enums/device-status.enum';

export class FilterDeviceDto {
  @ApiProperty({
    description: 'Filter by device name',
    required: false,
    example: 'Tablet'
  })
  @IsOptional()
  @IsString()
  device_name?: string;

  @ApiProperty({
    description: 'Filter by vehicle plate number',
    required: false,
    example: 'ABC-1234'
  })
  @IsOptional()
  @IsString()
  vehicle_plate_num?: string;

  @ApiProperty({
    description: 'Filter by device status',
    required: false,
    enum: DeviceStatus,
    example: DeviceStatus.active
  })
  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @ApiProperty({
    description: 'Filter by employee ID',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsString()
  employee_id?: string;

  @ApiProperty({
    description: 'Global search term (searches across device name, plate number, device ID, and employee info)',
    required: false,
    example: 'tablet'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: 1,
    minimum: 1,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Field to sort by',
    required: false,
    default: 'device_name',
    enum: ['device_name', 'vehicle_plate_num', 'status', 'employee_id'],
    example: 'device_name'
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'device_name';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    default: 'ASC',
    enum: ['ASC', 'DESC'],
    example: 'ASC'
  })
  @IsOptional()
  @IsString()
  sort_order?: 'ASC' | 'DESC' = 'ASC';
}