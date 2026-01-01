import { Module } from '@nestjs/common';
import { GmapsRoutingService } from './gmaps.service';
import { GmapsRoutingController } from './gmaps.controller';

@Module({
  controllers: [GmapsRoutingController],
  providers: [GmapsRoutingService],
})
export class GmapsModule {}
