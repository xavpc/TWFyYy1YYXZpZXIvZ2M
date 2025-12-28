import { PartialType } from "@nestjs/mapped-types";
import { CreateCollectedPointsDto } from "./create-collected-points.dto";

export class UpdateCollectedPointsDto extends PartialType(CreateCollectedPointsDto) {}