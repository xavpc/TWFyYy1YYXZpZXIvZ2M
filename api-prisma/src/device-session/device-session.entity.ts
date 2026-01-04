import { DeviceLocation } from "../device-location/device-location.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { CollectedPoints } from "../collected-points/collected-points.entity";
import { DeviceRoute } from "../device-route/device-route.entity";
import { Reports } from "../reports/reports.entity";

@Entity()
export class DeviceSession {
  @ApiProperty({
    description: 'Unique identifier for the device session',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  session_id: string;

  @ApiProperty({
    description: 'Timestamp when the session started',
    example: '2025-03-10T12:00:00Z',
    type: Date
  })
  @Column('timestamp')
  start: Date;

  @ApiProperty({
    description: 'Timestamp when the session ended (null if session is active)',
    example: '2025-03-10T13:30:00Z',
    type: Date,
    required: false,
    nullable: true
  })
  @Column('timestamp', { nullable: true,  default: null })
  end: Date;

  @ApiProperty({
    description: 'List of device locations recorded during this session',
    type: [DeviceLocation]
  })
  @OneToMany(() => DeviceLocation, (deviceLocation) => deviceLocation.session)
  device_locations: DeviceLocation[];

  @ApiProperty({
    description: 'List of Collected Points recorded during this session',
    type: [DeviceLocation]
  })
  @OneToMany(() => CollectedPoints, (collectedPoints) => collectedPoints.session)
  collected_points: CollectedPoints[];
  @ApiProperty({
    description: 'Associated report for this session',
    type: () => Reports 
  })
  @OneToOne(() => Reports, (reports) => reports.session, { nullable: true, onDelete: 'CASCADE' })
  reports: Reports;

  @ApiProperty({
    description: 'Associated deviceRoute of this session',
    type: DeviceRoute
  })
  @ManyToOne(() => DeviceRoute, (device_route) => device_route.device_sessions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_route_id' })
  device_route: DeviceRoute;
}