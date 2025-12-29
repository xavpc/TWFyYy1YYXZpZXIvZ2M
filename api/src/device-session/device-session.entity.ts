import { DeviceLocation } from "../device-location/device-location.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

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
  @Column('timestamp', { nullable: true })
  end: Date;

  @ApiProperty({
    description: 'List of device locations recorded during this session',
    type: [DeviceLocation]
  })
  @OneToMany(() => DeviceLocation, (deviceLocation) => deviceLocation.session)
  device_locations: DeviceLocation[];
}