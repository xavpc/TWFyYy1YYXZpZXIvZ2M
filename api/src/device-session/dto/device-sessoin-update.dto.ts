import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDeviceSessionDto {
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    end?: Date;
  }