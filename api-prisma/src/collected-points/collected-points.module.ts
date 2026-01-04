import { Module } from "@nestjs/common";
import { CollectedPointsController } from "./collected-points.controller";
import { CollectedPointsService } from "./collected-points.service";
import { DeviceLocationGateway } from "src/sockets/device-location.gateway";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [CollectedPointsController],
    providers: [CollectedPointsService, DeviceLocationGateway]
})
export class CollectedPointsModule {}
