import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceSession } from '../device-session/device-session.entity';

//warming, fix later because reports should not be deleted even though a route is deleted,else use soft delete
@Entity()
export class Reports {
  @ApiProperty({
    description: 'Unique identifier for the report',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @PrimaryGeneratedColumn('uuid')
  report_id: string;

  @ApiProperty({
    description: 'Associated device session of this report',
    type: () => DeviceSession 
  })
  @OneToOne(() => DeviceSession, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: DeviceSession;

  @ApiProperty({
    description: 'Route name extracted from the device route',
    example: 'Tokyo Central Route',
    type: String
  })
  @Column('varchar', { length: 255 })
  route_name: string;

  @ApiProperty({
    description: 'Vehicle plate number from the device',
    example: '品川500 さ 1234',
    type: String
  })
  @Column('varchar', { length: 50 })
  vehicle_plate_number: string;

  @ApiProperty({
    description: 'Employee name who operated the vehicle',
    example: 'Takeshi Sato',
    type: String
  })
  @Column('varchar', { length: 255 })
  employee_name: string;

  @ApiProperty({
    description: 'Time of the report generation',
    example: '2025-03-10T13:30:00Z',
    type: Date
  })
  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  report_timestamp: Date;

  @ApiProperty({
    description: 'Additional remarks or comments about the report',
    example: 'Route completed successfully with no incidents',
    type: String,
    required: false,
    nullable: true
  })
  @Column('text', { nullable: true })
  remarks: string;

  @ApiProperty({
    description: 'Start time of the session',
    example: '2025-03-10T12:00:00Z',
    type: Date
  })
  @Column('timestamp')
  session_start_time: Date;

  @ApiProperty({
    description: 'End time of the session',
    example: '2025-03-10T13:30:00Z',
    type: Date
  })
  @Column('timestamp')
  session_end_time: Date;
}