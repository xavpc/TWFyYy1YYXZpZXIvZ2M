import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AutoReportGenerationService } from 'src/scheduled-tasks/auto-report-generation.service';
import { AutoSessionEndService } from 'src/scheduled-tasks/auto-end-session.service';
import { DeviceSessionModule } from '../device-session/device-session.module';
import { ReportPdfService } from './report-pdf.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, DeviceSessionModule],
  providers: [
    ReportsService,
    ReportPdfService,
    AutoReportGenerationService,
    AutoSessionEndService,
  ],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
