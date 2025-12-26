import { PartialType } from "@nestjs/mapped-types";
import { CreateRouteDto } from "./create-route.dto";

export class UpdateDeviceDto extends PartialType(CreateRouteDto) {}