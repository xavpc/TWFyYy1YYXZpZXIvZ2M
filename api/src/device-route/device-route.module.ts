import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Device } from "../device/device.entity";
import { Route } from "src/route/route.entity";
import { DeviceRoute } from "./device-route.entity";
import { DeviceRouteController } from "./device-route.controller";
import { DeviceRouteService } from "./device-route.service";

@Module({
    imports: [TypeOrmModule.forFeature([Device, Route, DeviceRoute])],
    controllers: [DeviceRouteController],
    providers: [DeviceRouteService]
})
export class DeviceRouteModule {}