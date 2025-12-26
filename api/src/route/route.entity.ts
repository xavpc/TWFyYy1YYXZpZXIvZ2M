import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RouteCoordinates } from './route-coordinates/route-coordinates.entity';

@Entity()
export class Route {
  @PrimaryGeneratedColumn('uuid')
  route_id: string;

  @OneToMany(() => RouteCoordinates, (coordinates) => coordinates.route)
  route_coordinates: RouteCoordinates[];

  @Column({ nullable: false })
  route_name: string;

}