import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceRouteDay } from '../enums/device-route-day.enum';

export class CreateDeviceRouteDto {
    @ApiProperty({
        description: 'The UUID of the device',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsUUID()
    device_id: string;
  
    @ApiProperty({
        description: 'The UUID of the route',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNotEmpty()
    @IsUUID()
    route_id: string;

    @ApiProperty({
        description: 'Day when the route is assigned to the device',
        enum: DeviceRouteDay,
        example: DeviceRouteDay.MONDAY,
    })
    @IsNotEmpty()
    @IsEnum(DeviceRouteDay)
    day_assigned: DeviceRouteDay;
}