import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeviceSessionDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start?: Date;
}
