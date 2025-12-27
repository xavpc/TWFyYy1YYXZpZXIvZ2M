import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CollectionPointsService } from "./collection-points.service";
import { CollectionPointsController } from "./collection-points.controller";
import { CollectionPoints } from "./collection-points.entity";
import { Route } from "../route/route.entity";

@Module({
    imports: [TypeOrmModule.forFeature([CollectionPoints, Route])],
    controllers: [CollectionPointsController],
    providers: [CollectionPointsService]
})
export class CollectionPointsModule {}