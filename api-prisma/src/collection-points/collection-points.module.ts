import { Module } from "@nestjs/common";
import { CollectionPointsService } from "./collection-points.service";
import { CollectionPointsController } from "./collection-points.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [CollectionPointsController],
    providers: [CollectionPointsService]
})
export class CollectionPointsModule {}
