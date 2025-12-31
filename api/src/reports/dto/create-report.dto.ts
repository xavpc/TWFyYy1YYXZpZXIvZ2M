import { IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    description: 'The ID of the completed session',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  session_id: string;

  @ApiProperty({
    description: 'Additional remarks or comments about the report',
    example: 'Route completed successfully with no incidents',
    required: false,
  })
  @IsString()
  @IsOptional()
  remarks?: string;
}
