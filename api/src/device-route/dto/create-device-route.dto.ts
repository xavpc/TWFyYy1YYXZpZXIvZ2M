import { IsNotEmpty, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceRouteDto {
  
  @IsNotEmpty()
  @IsUUID()
  device_route_id: string;


  @IsNotEmpty()
  @IsUUID()
  device_id: string;

  @IsNotEmpty()
  @IsUUID()
  route_id: string;


}
