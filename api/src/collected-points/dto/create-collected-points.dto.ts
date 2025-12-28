import { IsNotEmpty, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCollectedPointsDto {
    @ApiProperty({
        description: 'The UUID of the device that collected the point',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsUUID()
    device_id: string;
  
    @ApiProperty({
        description: 'The UUID of the collection point',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsUUID()
    collection_point_id: string;

    @ApiProperty({
        description: 'Timestamp when the point was collected by the device',
        example: '2024-02-10T11:55:00Z',
    })
    @IsNotEmpty()
    @IsDateString()
    collected_timestamp: string;
}