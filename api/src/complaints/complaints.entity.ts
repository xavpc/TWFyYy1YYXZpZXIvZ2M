
import { Image } from "../image/image.entity";
import { CollectedPoints } from "../collected-points/collected-points.entity";
import { Route } from "../route/route.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Device } from "../device/device.entity";

@Entity()
export class Complaints {
  @PrimaryGeneratedColumn('uuid')
  complaint_id: string;


  @ManyToOne(() => Image, (image) => image.complaints, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'image_id' })
  image: Image;

  @ManyToOne(() => Device, (device) => device.complaints, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;


  //TODO: add title
  @Column({ nullable: false, unique: true })
  description: string;

  @Column('decimal', { precision: 8, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 9, scale: 6 })
  longitude: number;

  @CreateDateColumn()
  timestamp: Date;
  

}
