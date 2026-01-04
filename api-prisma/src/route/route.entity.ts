import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RouteCoordinates } from '../route-coordinates/route-coordinates.entity';
import { DeviceRoute } from '../device-route/device-route.entity';
import { CollectionPoints } from '../collection-points/collection-points.entity';
import { Image } from '../image/image.entity';
import { DeviceLocation } from '../device-location/device-location.entity';
import { DeviceSession } from '../device-session/device-session.entity';

@Entity()
export class Route {
  @ApiProperty({
    description: 'Unique identifier for the route (UUID)',
    example: 'e5a53ba6-deda-11ef-9da2-54ee75718d0f',
  })
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  route_id: string;

  @ApiProperty({
    description: 'List of coordinates associated with the route',
    type: () => [RouteCoordinates],
    example: [
      {
        route_coordinates_id: '123e4567-e89b-12d3-a456-426614174000',
        latitude: 35.6895,
        longitude: 139.6917,
      },
    ],
  })
  @OneToMany(() => RouteCoordinates, (coordinates) => coordinates.route)
  route_coordinates: RouteCoordinates[];

  @OneToMany(() => CollectionPoints, (collection_points) => collection_points.route)
  collection_points: CollectionPoints[];

  @OneToMany(() => Image, (image) => image.route)
  images: Image[];

  @OneToMany(() => DeviceRoute, deviceRoute => deviceRoute.route)
  deviceRoutes: DeviceRoute[];

  @ApiProperty({
    description: 'Name of the route (must be unique)',
    example: 'Route D',
  })
  @Column({ nullable: false, unique: true })
  route_name: string;


  @ApiProperty({
    description: 'Center Latitude of the route coordinate',
    example: 35.6895,
  })
  @Column('decimal', { 
    precision: 8, 
    scale: 6, 
    default: 35.6763976
  })
  center_latitude: number;

  @ApiProperty({
    description: 'Center Longitude of the route coordinate',
    example: 139.6917,
  })
  @Column('decimal', { 
    precision: 9, 
    scale: 6, 
    default: 139.6993259
  })
  center_longitude: number;


  @CreateDateColumn()
  @ApiProperty({
    description: 'Date and time when the employee was created',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'Date and time when the employee was last updated',
    example: '2024-01-20T14:45:00Z',
  })
  updated_at: Date;

  
}