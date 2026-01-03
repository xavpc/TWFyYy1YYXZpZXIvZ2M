import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { CreateDeviceSessionDto } from './device-session-create.dto';

export class UpdateDeviceSessionDto extends PartialType(CreateDeviceSessionDto){
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    end?: Date;
  }