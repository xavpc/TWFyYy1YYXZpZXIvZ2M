import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteDto {
  @ApiProperty({
    description: 'Name of the route (must be unique)',
    example: 'Route D',
  })
  @IsString()
  @IsNotEmpty({ message: 'Route name is required' })
  route_name: string;

    // @ApiProperty({
    //   description: 'Center Latitude of the route coordinate (range: -90 to 90)',
    //   example: 35.6895,
    // })
    // @IsNotEmpty()
    // @IsNumber()
    // @Min(-90)
    // @Max(90)
    // center_latitude: number;
  
    // @ApiProperty({
    //   description: 'Center Longitude of the route coordinate (range: -180 to 180)',
    //   example: 139.6917,
    // })
    // @IsNotEmpty()
    // @IsNumber()
    // @Min(-180)
    // @Max(180)
    // center_longitude: number;
}
