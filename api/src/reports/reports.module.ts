import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reports } from './reports.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { DeviceSession } from '../device-session/device-session.entity';
import { AutoReportGenerationService } from 'src/scheduled-tasks/auto-report-generation.service';
import { AutoSessionEndService } from 'src/scheduled-tasks/auto-end-session.service';
import { DeviceSessionModule } from '../device-session/device-session.module'; // Import the module

@Module({
  imports: [
    TypeOrmModule.forFeature([Reports, DeviceSession]),
    DeviceSessionModule, 
  ],
  providers: [
    ReportsService, 
    AutoReportGenerationService, 
    AutoSessionEndService,
  ],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}