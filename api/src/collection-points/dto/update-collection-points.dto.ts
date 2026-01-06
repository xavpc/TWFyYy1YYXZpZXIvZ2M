import { PartialType } from "@nestjs/mapped-types";
import { CreateCollectionPointsDto } from "./create-collection-points.dto";

export class UpdateCollectionPointsDto extends PartialType(CreateCollectionPointsDto) {}