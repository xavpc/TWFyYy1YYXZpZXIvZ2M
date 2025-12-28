
import { CollectionPoints } from "../collection-points/collection-points.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Route } from "../route/route.entity";
import { ImageStatus } from "./enums/device-status.enum";

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  image_id: string;

  @ManyToOne(() => Route, (route) => route.images)
  @JoinColumn({ name: 'route_id' })
  route: Route;


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
