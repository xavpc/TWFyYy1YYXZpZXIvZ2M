import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RouteCoordinatesController } from "./route-coordinates.controller";
import { RouteCoordinatesService } from "./route-coordinates.service";
import { RouteCoordinates } from "./route-coordinates.entity";
import { Route } from "../route/route.entity";

@Module({
    imports: [TypeOrmModule.forFeature([RouteCoordinates, Route])],
    controllers: [RouteCoordinatesController],
    providers: [RouteCoordinatesService]
})
export class RouteCoordinatesModule {}