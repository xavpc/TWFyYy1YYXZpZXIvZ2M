import { Device } from "../device/device.entity";
import { Route } from "../route/route.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { DeviceRouteDay } from "./enums/device-route-day.enum";

@Entity()
@Unique(['route', 'day_assigned'])
export class DeviceRoute {
  @ApiProperty({
    description: 'Unique identifier for the device route',
    format: 'uuid'
  })
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  device_route_id: string;

  @ApiProperty({
    description: 'The associated device',
    type: () => Device
  })
  @ManyToOne(() => Device, (device) => device.deviceRoutes, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @ApiProperty({
    description: 'The associated route',
    type: () => Route
  })
  @ManyToOne(() => Route, (route) => route.deviceRoutes, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @Column({
    type: 'enum',
    enum: DeviceRouteDay,
  })
  @ApiProperty({
    description: 'Routes will be asigned on a specific day for a device',
    enum: DeviceRouteDay,
    example: DeviceRouteDay.MONDAY,
  })
  day_assigned: DeviceRouteDay;
}