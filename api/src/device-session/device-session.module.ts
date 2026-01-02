import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeviceSession } from "./device-session.entity";
import { DeviceLocation } from "../device-location/device-location.entity";
import { DeviceSessionService } from "./device-session.service";
import { DeviceSessionController } from "./device-session.controller";
import { DeviceRoute } from "../device-route/device-route.entity";

@Module({
    imports: [TypeOrmModule.forFeature([DeviceSession, DeviceLocation, DeviceRoute])],
    controllers: [DeviceSessionController],
    providers: [DeviceSessionService],
    exports:[DeviceSessionService]
})
export class DeviceSessionModule {}