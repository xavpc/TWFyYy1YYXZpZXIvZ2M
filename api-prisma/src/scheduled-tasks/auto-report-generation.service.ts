import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { DeviceSessionService } from '../device-session/device-session.service';
import { ReportsService } from 'src/reports/reports.service';
import { Repository, In } from 'typeorm';
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
      
      if (!recentlyEndedSessions || recentlyEndedSessions.length === 0) {
        this.logger.debug('No new ended sessions found for report generation');
        return;
      }
      
      const sessionIds = recentlyEndedSessions
        .filter(session => session && session.session_id)
        .map(session => session.session_id);
      
      if (sessionIds.length === 0) {
        this.logger.debug('No valid session IDs found for report generation');
        return;
      }
      
      const sessionsWithReports = await this.reportRepository
        .createQueryBuilder('report')
        .leftJoinAndSelect('report.session', 'session')
        .where('session.session_id IN (:...sessionIds)', { sessionIds })
        .getMany();
      
      const sessionIdsWithReports = new Set(
        sessionsWithReports
          .filter(report => report.session)
          .map(report => report.session.session_id)
      );
      
      const sessionsToProcess = recentlyEndedSessions.filter(
        session => session && 
                  session.session_id && 
                  !sessionIdsWithReports.has(session.session_id) &&
                  !this.processedSessionIds.has(session.session_id)
      );
      
      this.logger.debug(`Found ${sessionsToProcess.length} sessions needing reports after filtering out existing ones`);
      
      if (sessionsToProcess.length === 0) {
        this.logger.debug('No new sessions to process after filtering');
        return;
      }
      
      const results: Reports[] = [];
      for (const session of sessionsToProcess) {
        try {
          this.logger.debug(`Creating report for session ${session.session_id}`);
          
          const existingReport = await this.reportRepository.findOne({
            where: { session: { session_id: session.session_id } },
            relations: ['session']
          });
          
          if (existingReport) {
            this.logger.debug(`Report already exists for session ${session.session_id}, skipping`);
            this.processedSessionIds.add(session.session_id);
            continue;
          }
          
          const newReport = await this.reportService.create({
            session_id: session.session_id,
            remarks: `Auto-generated report for session at ${session.end.toLocaleDateString()} at ${session.end.toLocaleTimeString()}`
          });
          
          this.processedSessionIds.add(session.session_id);
          results.push(newReport);
        } catch (error) {
          if (error.message && error.message.includes('Duplicate entry')) {
            this.logger.warn(`Duplicate report detected for session ${session.session_id}, marking as processed`);
            this.processedSessionIds.add(session.session_id);
          } else {
            this.logger.error(`Error creating report for session ${session.session_id}: ${error.message}`);
          }
        }
      }
      
      this.logger.debug(`Successfully generated ${results.length} new reports`);
      
      if (this.processedSessionIds.size > 1000) {
        this.logger.debug('Cleaning up processed session ID cache');
        this.processedSessionIds.clear();
        sessionIdsWithReports.forEach(id => this.processedSessionIds.add(id));
        sessionsToProcess.forEach(session => this.processedSessionIds.add(session.session_id));
      }
    } catch (error) {
      this.logger.error(`Error generating reports: ${error.message}`, error.stack);
      throw error;
    }
  }

  async manuallyGenerateReports() {
    await this.handleAutoReportGeneration();
    return { message: 'Reports generation triggered manually' };
  }
}