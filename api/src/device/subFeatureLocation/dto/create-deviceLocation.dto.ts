import { IsNotEmpty, IsNumber, IsUUID, IsDate, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeviceLocationDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  timestamp: Date;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  sequence: number;

  @IsNotEmpty()
  @IsUUID('4')
  device_id: string;
}