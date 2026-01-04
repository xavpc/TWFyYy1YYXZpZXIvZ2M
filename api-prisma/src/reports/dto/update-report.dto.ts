import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReportDto {
  @ApiProperty({
    description: 'Additional remarks or comments about the report',
    example: 'Route completed successfully with no incidents',
    required: false,
  })
  @IsString()
  @IsOptional()
  remarks?: string;
}