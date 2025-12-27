import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Route } from '../route.entity';

@Entity()
export class RouteCoordinates {
  @PrimaryGeneratedColumn('uuid')
  route_coordinates_id: string;

  @ManyToOne(() => Route, (route) => route.route_coordinates)
  @JoinColumn({ name: 'route_id' })  
  route: Route;

  @Column('decimal', { precision: 8, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 9, scale: 6 })
  longitude: number;

}