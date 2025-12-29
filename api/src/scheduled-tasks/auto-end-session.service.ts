import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DeviceSessionService } from '../device-session/device-session.service';

@Injectable()
export class AutoSessionEndService {
  private readonly logger = new Logger(AutoSessionEndService.name);
  
  constructor(
    private readonly deviceSessionService: DeviceSessionService,
  ) {}

  @Cron('0 0 * * *', {
    timeZone: 'Asia/Singapore' // or 'Asia/Manila', 'Asia/Hong_Kong', etc. (UTC+8 zones)
  })
  async handleCronEndSessions() {
    this.logger.debug('Running auto session end job...');
    
    try {
      const activeSessions = await this.deviceSessionService.findActiveSessions();
      
      if (activeSessions.length === 0) {
        this.logger.debug('No active sessions found to end');
        return;
      }
      
      const endedSessions = await Promise.all(
        activeSessions.map(session => 
          this.deviceSessionService.endSession(session.session_id)
        )
      );
      
      this.logger.debug(`Successfully ended ${endedSessions.length} sessions`);
    } catch (error) {
      this.logger.error(`Error ending sessions: ${error.message}`, error.stack);
    }
  }
}