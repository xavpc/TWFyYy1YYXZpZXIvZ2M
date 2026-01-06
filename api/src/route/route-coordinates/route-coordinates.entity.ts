import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Route } from '../route.entity';

@Entity()
export class RouteCoordinates {
  @PrimaryGeneratedColumn('uuid')
  route_coordinates_id: string;

  @ManyToOne(() => Route, (route) => route.route_coordinates)
  @JoinColumn({ name: 'route_id' })  
  route: Route;

  @Column({ nullable: false })
  route_name: string;

}