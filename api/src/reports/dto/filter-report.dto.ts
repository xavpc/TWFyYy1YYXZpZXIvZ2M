import { IsString, IsOptional, IsDateString, IsNumber, Min, IsIn, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FilterReportDto {
  @ApiProperty({
    description: 'Filter by route name (partial match)',
    example: 'Tokyo',
    required: false,
  })
  @IsString()
  @IsOptional()
  route_name?: string;

  @ApiProperty({
    description: 'Filter by vehicle plate number (partial match)',
    example: '1234',
    required: false,
  })
  @IsString()
  @IsOptional()
  vehicle_plate_number?: string;

  @ApiProperty({
    description: 'Filter by employee name (partial match)',
    example: 'Takeshi',
    required: false,
  })
  @IsString()
  @IsOptional()
  employee_name?: string;

  @ApiProperty({
    description: 'Filter reports from this date (YYYY-MM-DD)',
    example: '2025-03-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiProperty({
    description: 'Filter reports until this date (YYYY-MM-DD)',
    example: '2025-03-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiProperty({
    description: 'Filter sessions that started after this time (HH:MM)',
    example: '09:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  start_time?: string;

  @ApiProperty({
    description: 'Filter sessions that ended before this time (HH:MM)',
    example: '17:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  end_time?: string;

  @ApiProperty({
    description: 'Search in remarks (partial match)',
    example: 'incident',
    required: false,
  })
  @IsString()
  @IsOptional()
  remarks_search?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Field to sort by',
    example: 'report_timestamp',
    default: 'report_timestamp',
    required: false,
    enum: ['report_timestamp', 'route_name', 'employee_name', 'vehicle_plate_number', 'session_start_time', 'session_end_time'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['report_timestamp', 'route_name', 'employee_name', 'vehicle_plate_number', 'session_start_time', 'session_end_time'])
  sort_by?: string = 'report_timestamp';

  @ApiProperty({
    description: 'Sort order',
    example: 'DESC',
    default: 'DESC',
    required: false,
    enum: ['ASC', 'DESC'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';
}