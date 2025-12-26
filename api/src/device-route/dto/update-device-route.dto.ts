import { PartialType } from "@nestjs/mapped-types";
import { CreateDeviceRouteDto } from "./create-device-route.dto";

export class UpdateDeviceRouteDto extends PartialType(CreateDeviceRouteDto) {}