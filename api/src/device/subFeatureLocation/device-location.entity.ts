import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Device } from "../device.entity";


@Entity()
export class DeviceLocation{
  @PrimaryGeneratedColumn('uuid')
  device_location_id: string;

  @ManyToOne(() => Device, (device) => device.device_locations)
  @JoinColumn({ name: 'device_id' })  
  device: Device;

  @Column('decimal', { precision: 8, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 9, scale: 6 })
  longitude: number;

  @CreateDateColumn()
  timestamp: Date;

  @Index('IDX_SEQUENCE', { unique: true })
  @Column('int', { unique: true })
  sequence: number;

}