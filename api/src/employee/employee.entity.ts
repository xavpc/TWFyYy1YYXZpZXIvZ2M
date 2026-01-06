import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Device } from '../device/device.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Employee {
  @ApiProperty({
    description: 'Unique employee ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
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