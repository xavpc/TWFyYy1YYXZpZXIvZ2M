import { Module } from "@nestjs/common";
import { DeviceLocationController } from "./device-location.controller";
import { DeviceLocationService } from "./device-location.service";
import { DeviceLocationGateway } from "src/sockets/device-location.gateway";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [DeviceLocationController],
  providers: [DeviceLocationService, DeviceLocationGateway]
})
export class DeviceLocationModule {}
