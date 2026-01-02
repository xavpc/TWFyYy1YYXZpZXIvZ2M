import { DeviceLocation } from "../device-location/device-location.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity()
export class DeviceSession {
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  session_id: string;

  @Column('timestamp')
  start: Date;

  @Column('timestamp', { nullable: true })
  end: Date;

  @OneToMany(() => DeviceLocation, (deviceLocation) => deviceLocation.session)
  device_locations: DeviceLocation[];
}