import { Module } from '@nestjs/common';
import { AutoSessionEndService } from './auto-end-session.service';
import { DeviceSessionModule } from '../device-session/device-session.module';
import { ReportsModule } from '../reports/reports.module';
import { AutoReportGenerationService } from './auto-report-generation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule, DeviceSessionModule, ReportsModule],
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
