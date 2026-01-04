import { Employee } from '../employee/employee.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, Check, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DeviceStatus } from './enums/device-status.enum';
import { DeviceLocation } from '../device-location/device-location.entity';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceRoute } from '../device-route/device-route.entity';
import { CollectedPoints } from '../collected-points/collected-points.entity';
import { Complaints } from '../complaints/complaints.entity';


@Entity()
@Check('chk_device_id_nonempty', 'device_id <> ""')
export class Device {
  @ApiProperty({
    description: 'Unique device ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  device_id: string;

  @OneToMany(() => DeviceLocation, (location) => location.device)
  device_locations: DeviceLocation[];

  @OneToMany(() => CollectedPoints, (collected_points) => collected_points.device)
  collected_points: CollectedPoints[];

  @Column({ nullable: false })
  @ApiProperty({
    description: 'Name of the device',
    example: 'Tablet X12',
  })
  device_name: string;


  @OneToMany(() => DeviceRoute, deviceRoute => deviceRoute.device)
  deviceRoutes: DeviceRoute[];

  @OneToMany(() => Complaints, complaints => complaints.device)
  complaints: Complaints[];

  @ApiProperty({
    description: 'Employee assigned to the device',
    type: () => Employee,
  })
  @ManyToOne(() => Employee, (employee) => employee.devices, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
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


  @CreateDateColumn()
  @ApiProperty({
    description: 'Date and time when the device was created',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: Date;
  
  @UpdateDateColumn()
  @ApiProperty({
    description: 'Date and time when the device was last updated',
    example: '2024-01-20T14:45:00Z',
  })
  updated_at: Date;
}