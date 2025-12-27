import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Device } from "../device/device.entity";
import { Route } from "src/route/route.entity";
import { DeviceRoute } from "./device-route.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Device, Route, DeviceRoute])],
    // controllers: [DeviceLocationController],
    // providers: [DeviceLocationService]
})
export class DeviceLocationModule {}