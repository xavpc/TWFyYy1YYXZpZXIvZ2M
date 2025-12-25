import { Employee } from '../employee/employee.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  device_id: string;

  @ManyToMany(() => Employee, (employee) => employee.devices)
  employees: Employee[];
  
  @Column({ nullable: false }) 
  vehicle_plate_num: string;

  @Column({ nullable: true })
  status: string;

}