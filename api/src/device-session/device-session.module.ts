import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeviceSession } from "./device-session.entity";
@Module({
    imports: [TypeOrmModule.forFeature([DeviceSession])],
    controllers: [],
    providers: []
})
export class DeviceSessionModule {}