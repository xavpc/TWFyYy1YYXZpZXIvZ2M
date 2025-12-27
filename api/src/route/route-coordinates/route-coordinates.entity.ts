import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Route } from '../route.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class RouteCoordinates {
  @ApiProperty({
    description: 'Unique identifier for the route coordinates (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  route_coordinates_id: string;

  @ManyToOne(() => Route, (route) => route.route_coordinates)
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @ApiProperty({
    description: 'Latitude of the route coordinate',
    example: 35.6895,
  })
  @Column('decimal', { precision: 8, scale: 6 })
  latitude: number;

  @ApiProperty({
    description: 'Longitude of the route coordinate',
    example: 139.6917,
  })
  @Column('decimal', { precision: 9, scale: 6 })
  longitude: number;
}
