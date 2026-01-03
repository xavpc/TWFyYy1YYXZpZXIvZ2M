import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeviceSessionService } from '../device-session/device-session.service';
import { AutoReportGenerationService } from './auto-report-generation.service';

@Injectable()
export class AutoSessionEndService {
  private readonly logger = new Logger(AutoSessionEndService.name);
  
  constructor(
    private readonly deviceSessionService: DeviceSessionService,
    private readonly autoReportGenerationService: AutoReportGenerationService
  ) {}

  @Cron('0 0 * * *', {
    timeZone: 'Asia/Singapore'
  })
  async handleCronEndSessions() {
    this.logger.debug('Running auto session end job...');
    
    try {
      const activeSessions = await this.deviceSessionService.findActiveSessions();
      
      if (activeSessions.length === 0) {
        this.logger.debug('No active sessions found to end');
        await this.runReportGenerationWithRetries();
        return;
      }
      
      const endedSessions = await Promise.all(
        activeSessions.map(session => 
          this.deviceSessionService.endSession(session.session_id)
        )
      );
      
      this.logger.debug(`Successfully ended ${endedSessions.length} sessions`);
      
      await this.runReportGenerationWithRetries();
      
    } catch (error) {
      this.logger.error(`Error ending sessions: ${error.message}`, error.stack);
    }
  }
  
  public async runReportGenerationWithRetries(maxRetries = 3) {
    this.logger.debug(`Starting report generation with ${maxRetries} max retries`);
    
    let retryCount = 0;
    let success = false;
    
    while (retryCount < maxRetries && !success) {
      try {
        retryCount++;
        this.logger.debug(`Report generation attempt ${retryCount}/${maxRetries}`);
        
        await this.autoReportGenerationService.manuallyGenerateReports();
        success = true;
        this.logger.debug('Report generation completed successfully');
        
      } catch (error) {
        this.logger.error(`Report generation attempt ${retryCount} failed: ${error.message}`);
        
        if (retryCount < maxRetries) {
          const delayMs = 5000 * retryCount; 
          this.logger.debug(`Waiting ${delayMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    if (!success) {
      this.logger.error(`Report generation failed after ${maxRetries} attempts`);
    }
  }
}