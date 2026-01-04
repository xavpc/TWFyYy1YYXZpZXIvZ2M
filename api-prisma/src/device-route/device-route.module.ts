import { Module } from "@nestjs/common";
import { DeviceRouteController } from "./device-route.controller";
import { DeviceRouteService } from "./device-route.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [DeviceRouteController],
    providers: [DeviceRouteService]
})
export class DeviceRouteModule {}
