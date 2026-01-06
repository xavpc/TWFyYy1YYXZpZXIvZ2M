import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RouteCoordinates } from './route-coordinates/route-coordinates.entity';

@Entity()
export class Route {
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  route_id: string;

  @OneToMany(() => RouteCoordinates, (coordinates) => coordinates.route)
  route_coordinates: RouteCoordinates[];

  @Column({ nullable: false })
  route_name: string;

}