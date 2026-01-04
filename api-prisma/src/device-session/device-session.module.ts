import { Module } from "@nestjs/common";
import { DeviceSessionService } from "./device-session.service";
import { DeviceSessionController } from "./device-session.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [DeviceSessionController],
    providers: [DeviceSessionService],
    exports: [DeviceSessionService]
})
export class DeviceSessionModule {}
