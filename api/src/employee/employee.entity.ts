import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Device } from '../device/device.entity';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  employee_id: string;

  @OneToMany(() => Device, (device) => device.employee)
  devices: Device[];
  
  @Column({ nullable: false }) 
  first_name: string;

  @Column({ nullable: true })
  middle_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: false })
  contact_number: string;

  @Column({ nullable: false })
  email: string;

  @Column('int', { nullable: false })
  age: number;
}