import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, Max} from 'class-validator';

export class CreateRouteCoordinatesDto {
  @IsNotEmpty()
  @IsUUID()
  route_id: string;

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
}