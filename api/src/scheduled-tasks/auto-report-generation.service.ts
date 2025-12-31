import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { DeviceSessionService } from '../device-session/device-session.service';
import { ReportsService } from 'src/reports/reports.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceSession } from '../device-session/device-session.entity';
import { Reports } from '../reports/reports.entity';

@Injectable()
export class AutoReportGenerationService {
  private readonly logger = new Logger(AutoReportGenerationService.name);
  private processedSessionIds = new Set<string>();
  
  constructor(
    private readonly deviceSessionService: DeviceSessionService,
    private readonly reportService: ReportsService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectRepository(Reports)
    private reportRepository: Repository<Reports>,
  ) {
    // this.setupTestingInterval();
  }

  private setupTestingInterval() {
    const interval = setInterval(() => {
      this.handleAutoReportGeneration();
    }, 3000); 
    
    this.schedulerRegistry.addInterval('test-report-generation', interval);
    this.logger.debug('Test interval for report generation set up (every 3 seconds)');
  }

//   @Cron(CronExpression.EVERY_10_MINUTES, {
//     timeZone: 'Asia/Singapore' // or 'Asia/Manila', 'Asia/Hong_Kong', etc. (UTC+8 zones)
//   })
//   async handleCronReportGeneration() {
//     await this.handleAutoReportGeneration();
//   }

  async handleAutoReportGeneration() {
    this.logger.debug('Running auto report generation job...');
    
    try {
      const recentlyEndedSessions = await this.deviceSessionService.findRecentlyEndedSessions();
      
      if (recentlyEndedSessions.length === 0) {
        this.logger.debug('No new ended sessions found for report generation');
        return;
      }
      
      const sessionsToProcess = recentlyEndedSessions.filter(
        session => !this.processedSessionIds.has(session.session_id)
      );
      
      if (sessionsToProcess.length === 0) {
        this.logger.debug('All recently ended sessions already have reports');
        return;
      }
      
      this.logger.debug(`Found ${sessionsToProcess.length} ended sessions for report generation`);
      
      const existingReports = await this.reportRepository.find({
        where: sessionsToProcess.map(session => ({ session: { session_id: session.session_id } }))
      });
      
      const sessionIdsWithReports = new Set(
        existingReports.map(report => report.session.session_id)
      );
      
      const newReports = await Promise.all(
        sessionsToProcess
          .filter(session => !sessionIdsWithReports.has(session.session_id))
          .map(async session => {
            try {
              const newReport = await this.reportService.create({
                session_id: session.session_id,
                remarks: `Auto-generated report for session at ${session.end.toLocaleDateString()} at ${session.end.toLocaleTimeString()}`
              });
              
              this.processedSessionIds.add(session.session_id);
              return newReport;
            } catch (error) {
              this.logger.error(`Error creating report for session ${session.session_id}: ${error.message}`);
              return null;
            }
          })
      );
      
      const successfulReports = newReports.filter(report => report !== null);
      this.logger.debug(`Successfully generated ${successfulReports.length} new reports`);
      
                    // Prevent the set from growing indefinitely
                    if (this.processedSessionIds.size > 1000) {
                        this.logger.debug('Cleaning up processed session ID cache');
                        this.processedSessionIds.clear();
                        sessionIdsWithReports.forEach(id => this.processedSessionIds.add(id));
                    }
    } catch (error) {
      this.logger.error(`Error generating reports: ${error.message}`, error.stack);
    }
  }

  async manuallyGenerateReports() {
    await this.handleAutoReportGeneration();
    return { message: 'Reports generation triggered manually' };
  }
}