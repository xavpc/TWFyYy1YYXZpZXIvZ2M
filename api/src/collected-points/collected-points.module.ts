import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Device } from "../device/device.entity";
import { CollectedPoints } from "./collected-points.entity";
import { CollectionPoints } from "../collection-points/collection-points.entity";
import { CollectedPointsController } from "./collected-points.controller";
import { CollectedPointsService } from "./collected-points.service";
import { DeviceSession } from "../device-session/device-session.entity";
import { DeviceLocationGateway } from "src/sockets/device-location.gateway";

@Module({
    imports: [TypeOrmModule.forFeature([Device, CollectedPoints, CollectionPoints, DeviceSession])],
    controllers: [CollectedPointsController],
    providers: [CollectedPointsService, DeviceLocationGateway]
})
export class CollectedPointsModule {}