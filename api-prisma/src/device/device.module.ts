import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeviceController } from "./device.controller";
import { DeviceService } from "./device.service";
import { Device } from "./device.entity";
import { Employee } from "src/employee/employee.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Device, Employee])],
    controllers: [DeviceController],
    providers: [DeviceService]
})
export class DeviceModule {}