import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeStatus } from '../enums/employee-status.enum';

export class FilterEmployeeDto {
  @ApiPropertyOptional({ description: 'Filter by first name' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ description: 'Filter by middle name' })
  @IsOptional()
  @IsString()
  middle_name?: string;

  @ApiPropertyOptional({ description: 'Filter by last name' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ description: 'Filter by email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Filter by address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Filter by contact number' })
  @IsOptional()
  @IsString()
  contact_number?: string;

  @ApiPropertyOptional({ description: 'Filter by age' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  age?: number;

  @ApiPropertyOptional({ enum: EmployeeStatus, description: 'Filter by employee status' })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ description: 'Global search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort field', default: 'first_name' })
  @IsOptional()
  @IsString()
  sort_by?: string = 'first_name';

  @ApiPropertyOptional({ description: 'Sort order', default: 'ASC' })
  @IsOptional()
  @IsString()
  sort_order?: 'ASC' | 'DESC' = 'ASC';
}