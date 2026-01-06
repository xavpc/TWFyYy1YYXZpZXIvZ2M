import { Employee } from '../employee/employee.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { DeviceStatus } from './enums/device-status.enum';
import { DeviceLocation } from './device-location/device-location.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Device {
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  device_id: string;

  @OneToMany(() => DeviceLocation, (location) => location.device)
  device_locations: DeviceLocation[];

  @Column({ nullable: false }) 
  device_name: string;

  @ManyToOne(() => Employee, (employee) => employee.devices)
  @JoinColumn({ name: 'employee_id' })  
  employee: Employee;

  @Column({ nullable: false }) 
  vehicle_plate_num: string;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.ACTIVE
  })
  status: DeviceStatus;
}