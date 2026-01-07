import { IsNotEmpty, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCollectedPointsDto {
    @IsNotEmpty()
    @IsUUID()
    device_id: string;
  
    @IsNotEmpty()
    @IsUUID()
    collection_point_id: string;
  }
