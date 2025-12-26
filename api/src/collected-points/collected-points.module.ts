import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Device } from "../device/device.entity";
import { CollectedPoints } from "./collected-points.entity";
import { CollectionPoints } from "../collection-points/collection-points.entity";
import { CollectedPointsController } from "./collected-points.controller";
import { CollectedPointsService } from "./collected-points.service";

@Module({
    imports: [TypeOrmModule.forFeature([Device, CollectedPoints, CollectionPoints])],
    controllers: [CollectedPointsController],
    providers: [CollectedPointsService]
})
export class CollectedPointsModule {}