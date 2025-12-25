import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Device } from '../device/device.entity';
@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  employee_id: string;

  @ManyToMany(() => Device, (device) => device.employees)
  @JoinTable({
    name: 'employee_devices', 
    joinColumn: {
      name: 'employee_id',
      referencedColumnName: 'employee_id',
    },
    inverseJoinColumn: {
      name: 'device_id',
      referencedColumnName: 'device_id',
    },
  })
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