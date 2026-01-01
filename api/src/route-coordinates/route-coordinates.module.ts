import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RouteCoordinatesController } from "./route-coordinates.controller";
import { RouteCoordinatesService } from "./route-coordinates.service";
import { RouteCoordinates } from "./route-coordinates.entity";
import { Route } from "../route/route.entity";
import { GmapsModule } from "../third-party/routing-engine/google-maps/gmaps.module"; // Import the module, not the service

@Module({
    imports: [
        TypeOrmModule.forFeature([RouteCoordinates, Route]), // Only entities here
        GmapsModule 
    ],
    controllers: [RouteCoordinatesController],
    providers: [RouteCoordinatesService]
})
export class RouteCoordinatesModule {}