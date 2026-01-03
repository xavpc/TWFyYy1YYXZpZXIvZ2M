import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { Device } from "../device/device.entity";
import { DeviceSession } from "../device-session/device-session.entity";
import { Route } from "../route/route.entity";
import { Transform } from "class-transformer";

@Entity()
export class DeviceLocation {
  @ApiProperty({
    description: 'Unique identifier for the device location.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  device_location_id: string;

  @ManyToOne(() => Device, (device) => device.device_locations, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })  
  device: Device;

  @ApiProperty({
    description: 'The latitude of the device location. It should be between -90 and 90.',
    example: 34.052235,
    minimum: -90,
    maximum: 90,
  })
  @Column('decimal', { precision: 8, scale: 6 })
  latitude: number;

  @ApiProperty({
    description: 'The longitude of the device location. It should be between -180 and 180.',
    example: -118.243683,
    minimum: -180,
    maximum: 180,
  })
  @Column('decimal', { precision: 9, scale: 6 })
  longitude: number;

  @ApiProperty({
    description: 'Timestamp when the device location was pushed.',
    example: '2025-01-01T12:00:00Z',
  })
  @CreateDateColumn()
  push_timestamp: Date;

  @ApiProperty({
    description: 'Timestamp when the device location was created.',
    example: '2025-01-01T12:00:00Z',
  })
  @Column('timestamp')
  @Transform(({ value }) => {
    if (value instanceof Date) {
      // Preserve the original time components but format as ISO string with Z
      return `${value.getFullYear()}-${
        String(value.getMonth() + 1).padStart(2, '0')}-${
        String(value.getDate()).padStart(2, '0')}T${
        String(value.getHours()).padStart(2, '0')}:${
        String(value.getMinutes()).padStart(2, '0')}:${
        String(value.getSeconds()).padStart(2, '0')}.000Z`;
    }
    return value;
  })
  current_location_timestamp: Date;

  @ManyToOne(() => DeviceSession, (session) => session.device_locations, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: DeviceSession;
}
