import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RouteCoordinates } from '../route-coordinates/route-coordinates.entity';
import { DeviceRoute } from '../device-route/device-route.entity';

@Entity()
export class Route {
  @ApiProperty({
    description: 'Unique identifier for the route (UUID)',
    example: 'e5a53ba6-deda-11ef-9da2-54ee75718d0f',
  })
  @PrimaryGeneratedColumn('uuid')
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



  @OneToMany(() => DeviceRoute, deviceRoute => deviceRoute.route)
  deviceRoutes: DeviceRoute[];

  @ApiProperty({
    description: 'Name of the route (must be unique)',
    example: 'Route D',
  })
  @Column({ nullable: false, unique: true })
  route_name: string;
}