import { Module } from '@nestjs/common';
import { AutoSessionEndService } from './auto-end-session.service';
import { DeviceSessionModule } from '../device-session/device-session.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSession } from 'src/device-session/device-session.entity';
import { Reports } from 'src/reports/reports.entity';
import { ReportsModule } from '../reports/reports.module';
import { AutoReportGenerationService } from './auto-report-generation.service';

@Module({
    imports: [TypeOrmModule.forFeature([DeviceSession,Reports]), DeviceSessionModule, ReportsModule],
  providers: [
    AutoSessionEndService,
    AutoReportGenerationService,

  ],
  exports: [
    AutoSessionEndService,
    AutoReportGenerationService
  ],
})
export class ScheduledTasksModule {}