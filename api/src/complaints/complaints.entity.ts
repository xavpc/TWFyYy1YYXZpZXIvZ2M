
import { Image } from "../image/image.entity";
import { CollectedPoints } from "../collected-points/collected-points.entity";
import { Route } from "../route/route.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Device } from "../device/device.entity";

@Entity()
export class Complaints {
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  complaint_id: string;


  @ManyToOne(() => Image, (image) => image.complaints, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'image_id' })
  image: Image;

  @ManyToOne(() => Device, (device) => device.complaints, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;


  @Column({ nullable: false, unique: true })
  title: string;

  @Column({ nullable: false, unique: true })
  description: string;

  @Column('decimal', { precision: 8, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 9, scale: 6 })
  longitude: number;


  @CreateDateColumn()
  push_timestamp: Date;


  @Column('timestamp')
  complaint_timestamp: Date;
}
