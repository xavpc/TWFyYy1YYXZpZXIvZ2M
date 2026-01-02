import { Module } from '@nestjs/common';
import { AutoSessionEndService } from './auto-end-session.service';
import { DeviceSessionModule } from '../device-session/device-session.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSession } from 'src/device-session/device-session.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DeviceSession]), DeviceSessionModule],
  providers: [AutoSessionEndService],
  exports: [AutoSessionEndService],
})
export class ScheduledTasksModule {}