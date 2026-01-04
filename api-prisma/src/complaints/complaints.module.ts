import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ComplaintsService } from "./complaints.service";
import { ComplaintsController } from "./complaints.controller";
import { Complaints } from "./complaints.entity";
import { Image } from "../image/image.entity";
import { Device } from "../device/device.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Complaints, Image, Device])],
    controllers: [ComplaintsController],
    providers: [ComplaintsService]
})
export class ComplaintsModule {}