import { Module } from "@nestjs/common";
import { RouteCoordinatesController } from "./route-coordinates.controller";
import { RouteCoordinatesService } from "./route-coordinates.service";
import { GmapsModule } from "../third-party/routing-engine/google-maps/gmaps.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule, GmapsModule],
    controllers: [RouteCoordinatesController],
    providers: [RouteCoordinatesService]
})
export class RouteCoordinatesModule {}
