import { CollectionPoints } from "../collection-points/collection-points.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Device } from "../device/device.entity";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class CollectedPoints {
  @ApiProperty({
    description: 'Unique identifier for the collected point',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  collected_point_id: string;

  @ApiProperty({
    description: 'The associated collection point',
    type: () => CollectionPoints
  })
  @ManyToOne(() => CollectionPoints, (collection_point) => collection_point.collected_points)
  @JoinColumn({ name: 'collection_point_id' })
  collection_point: CollectionPoints;

  @ApiProperty({
    description: 'The device that collected the point',
    type: () => Device
  })
  @ManyToOne(() => Device, (device) => device.collected_points)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @ApiProperty({
    description: 'Timestamp when the point was pushed to the server',
    example: '2024-02-10T12:00:00Z'
  })
  @CreateDateColumn()
  push_timestamp: Date;

  @ApiProperty({
    description: 'Timestamp when the point was actually collected by the device',
    example: '2024-02-10T11:55:00Z'
  })
  @Column('timestamp')
  collected_timestamp: Date;
}