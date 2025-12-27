import { IsString, IsNotEmpty} from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty({ message: 'Device name is required' })
  route_name: string;
}