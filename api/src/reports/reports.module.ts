import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reports } from './reports.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { DeviceSession } from '../device-session/device-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reports, DeviceSession]),
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}