import { Module } from '@nestjs/common';
import { OsrmService } from './osrm.service';
import { OsrmController } from './osrm.controller';

@Module({
  controllers: [OsrmController],
  providers: [OsrmService],
})
export class OsrmModule {}
