
import { CollectionPoints } from "../collection-points/collection-points.entity";

import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Device } from "../device/device.entity";

@Entity()
export class CollectedPoints {
  @PrimaryGeneratedColumn('uuid')
  collected_point_id: string;

  @ManyToOne(() => CollectionPoints, (collection_point) => collection_point.collected_points)
  @JoinColumn({ name: 'collection_point_id' })
  collection_point: CollectionPoints;


  @ManyToOne(() => Device, (device) => device.collected_points)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @CreateDateColumn()
  timestamp: Date;
}
