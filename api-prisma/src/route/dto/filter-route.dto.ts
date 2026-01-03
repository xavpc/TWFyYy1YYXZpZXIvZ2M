import { IsOptional, IsString, IsInt, Min, IsIn, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterRouteDto {
  @ApiPropertyOptional({
    description: 'Filter by route name (partial match)',
    example: 'Route A'
  })
  @IsOptional()
  @IsString()
  route_name?: string;

  @ApiPropertyOptional({
    description: 'Global search across route name, ID, and assigned device information',
    example: 'Downtown'
  })
  @IsOptional()
  @IsString()
  search?: string;

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
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'route_name',
    enum: ['route_name', 'route_id', 'center_latitude', 'center_longitude'],
    default: 'route_name'
  })
  @IsOptional()
  @IsString()
  @IsIn(['route_name', 'route_id', 'center_latitude', 'center_longitude'])
  sort_by?: string = 'route_name';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    default: 'ASC'
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'ASC';


}