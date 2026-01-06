import { Employee } from '../employee/employee.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  device_id: string;

  @ManyToOne(() => Employee, (employee) => employee.devices)
  @JoinColumn({ name: 'employee_id' })  
  employee: Employee;

  @Column({ nullable: false }) 
  vehicle_plate_num: string;

  @Column({ nullable: true })
  status: string;
  device: Employee[];
}