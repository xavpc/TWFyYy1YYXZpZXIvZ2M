import { Employee } from '../employee/employee.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { DeviceStatus } from './enums/device-status.enum';
import { DeviceLocation } from '../device-location/device-location.entity';
import { ApiProperty } from '@nestjs/swagger';


@Entity()
export class Device {
  @ApiProperty({
    description: 'Unique device ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  device_id: string;

  @OneToMany(() => DeviceLocation, (location) => location.device)
  device_locations: DeviceLocation[];

  @Column({ nullable: false })
  @ApiProperty({
    description: 'Name of the device',
    example: 'Tablet X12',
  })
  device_name: string;

  @ManyToOne(() => Employee, (employee) => employee.devices)
  @JoinColumn({ name: 'employee_id' })
  @ApiProperty({
    description: 'Employee assigned to the device',
    type: () => Employee,
  })
  employee: Employee;

  @Column({ nullable: false })
  @ApiProperty({
    description: 'Vehicle plate number associated with the device',
    example: 'ABC-1234',
  })
  vehicle_plate_num: string;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.ACTIVE,
  })
  @ApiProperty({
    description: 'Current status of the device',
    enum: DeviceStatus,
    example: DeviceStatus.ACTIVE,
  })
  status: DeviceStatus;
}
