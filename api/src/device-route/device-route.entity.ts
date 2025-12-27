import { Device } from "../device/device.entity";
import { Route } from "../route/route.entity";
import {  Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DeviceRoute {
  @PrimaryGeneratedColumn('uuid')
  device_route_id: string;

  @ManyToOne(() => Device, device => device.deviceRoutes)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @ManyToOne(() => Route, route => route.deviceRoutes)
  @JoinColumn({ name: 'route_id' })
  route: Route;

}