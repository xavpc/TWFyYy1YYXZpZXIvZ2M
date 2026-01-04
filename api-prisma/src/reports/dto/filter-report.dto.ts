import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterReportDto {
  @ApiPropertyOptional({
    description: 'Global search across route name, vehicle plate, employee name, and remarks',
    example: 'Tokyo'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by route name',
    example: 'Tokyo Central Route'
  })
  @IsOptional()
  @IsString()
  route_name?: string;

  @ApiPropertyOptional({
    description: 'Filter by vehicle plate number',
    example: '品川500 さ 1234'
  })
  @IsOptional()
  @IsString()
  vehicle_plate_number?: string;

  @ApiPropertyOptional({
    description: 'Filter by employee name',
    example: 'Takeshi Sato'
  })
  @IsOptional()
  @IsString()
  employee_name?: string;

  @ApiPropertyOptional({
    description: 'Search in remarks/comments',
    example: 'incident'
  })
  @IsOptional()
  @IsString()
  remarks_search?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering reports (YYYY-MM-DD)',
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering reports (YYYY-MM-DD)',
    example: '2025-01-31'
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'report_timestamp',
    default: 'report_timestamp'
  })
  @IsOptional()
  @IsString()
  @IsIn(['report_timestamp', 'route_name', 'vehicle_plate_number', 'employee_name', 'session_start_time', 'session_end_time'])
  sort_by?: string = 'report_timestamp';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    default: 'DESC'
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';
}