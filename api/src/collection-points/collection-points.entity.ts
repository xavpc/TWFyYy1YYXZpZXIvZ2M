
import { Route } from "../route/route.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CollectionPoints {
  @PrimaryGeneratedColumn('uuid')
  collection_point_id: string;

  @ManyToOne(() => Route, (route) => route.collection_points, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @Column({ nullable: false, unique: true })
  collection_point_name: string;

  @Column('decimal', { precision: 8, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 9, scale: 6 })
  longitude: number;
}
