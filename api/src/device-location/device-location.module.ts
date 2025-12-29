import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeviceLocationController } from "./device-location.controller";
import { DeviceLocationService } from "./device-location.service";
import { DeviceLocation } from "./device-location.entity";
import { Device } from "../device/device.entity";
import { DeviceSession } from "../device-session/device-session.entity";

@Module({
    imports: [TypeOrmModule.forFeature([DeviceLocation, Device, DeviceSession])],
    controllers: [DeviceLocationController],
    providers: [DeviceLocationService]
})
export class DeviceLocationModule {}