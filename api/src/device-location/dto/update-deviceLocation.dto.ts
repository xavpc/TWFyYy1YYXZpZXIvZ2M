import { PartialType } from "@nestjs/mapped-types";
import { CreateDeviceLocationDto } from "./create-deviceLocation.dto";

export class UpdateDeviceLocationDto extends PartialType(CreateDeviceLocationDto) {}