import { IsDate, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceSessionDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start?: Date;

  @ApiProperty({
    description: 'The UUID of the associated device route',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  device_route_id: string;


}
