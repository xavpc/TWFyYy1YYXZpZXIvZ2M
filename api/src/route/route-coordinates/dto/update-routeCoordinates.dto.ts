import { PartialType } from "@nestjs/mapped-types";
import { CreateRouteCoordinatesDto } from "./create-routeCoordinates.dto";

export class UpdateRouteCoordinatesDto extends PartialType(CreateRouteCoordinatesDto) {}