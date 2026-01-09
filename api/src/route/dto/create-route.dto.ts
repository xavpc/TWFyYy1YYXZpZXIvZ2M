import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteDto {
  @ApiProperty({
    description: 'Name of the route (must be unique)',
    example: 'Route D',
  })
  @IsString()
  @IsNotEmpty({ message: 'Route name is required' })
  route_name: string;
}
