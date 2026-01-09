
import { CollectionPoints } from "../collection-points/collection-points.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Route } from "../route/route.entity";
import { ImageStatus } from "./enums/device-status.enum";
import { Complaints } from "../complaints/complaints.entity";

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  image_id: string;

  @ManyToOne(() => Route, (route) => route.images,{ nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @OneToMany(() => Complaints, complaints => complaints.image)
  complaints: Complaints[];


  @Column({nullable : false})
  image_url: string;

  @Column({nullable : false})
  file_name: string;

  @Column({
      type: 'enum',
      enum: ImageStatus,
      default: ImageStatus.ACTIVE,
  })
  status: ImageStatus;
}
