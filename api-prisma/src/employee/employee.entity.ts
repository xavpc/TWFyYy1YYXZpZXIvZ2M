import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from '../auth/user/user.entity';
import { Device } from '../device/device.entity';
import { EmployeeStatus } from './enums/employee-status.enum';

@Entity()
export class Employee {
  @ApiProperty({
    description: 'Unique employee ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  employee_id: string;

  @OneToMany(() => Device, (device) => device.employee)
  devices: Device[];

  @Column({ nullable: false })
  @ApiProperty({
    description: 'First name of the employee (名)',
    example: 'Takeshi', 
  })
  first_name: string;

  @Column({ nullable: true,  default: null })
  @ApiProperty({
    description: 'Middle name of the employee',
    example: 'Yuji',  
  })
  middle_name: string;

  @Column({ nullable: false })
  @ApiProperty({
    description: 'Last name of the employee (姓)',
    example: 'Sato',  
  })
  last_name: string;

  @Column({ nullable: false })
  @ApiProperty({
    description: 'Email address of the employee',
    example: 't.sato@example.com', 
  })
  email: string;

  @Column({ nullable: false })
  @ApiProperty({
    description: 'Contact number of the employee',
    example: '090-1234-5678',  
  })
  contact_number: string;

  @Column({ nullable: false })
  @ApiProperty({
    description: 'Address of the employee',
    example: 'Shibuya 1-2-3, Shibuya-ku, Tokyo',  
  })
  address: string;

  @Column('int', { nullable: false })
  @ApiProperty({
    description: 'Age of the employee',
    example: 30,  
  })
  age: number;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  @ApiProperty({
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
    description: 'Employee status'
  })
  status: EmployeeStatus;

  @OneToOne(() => Users, user => user.employee)
  user: Users;

  @CreateDateColumn()
  @ApiProperty({
    description: 'Date and time when the employee was created',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'Date and time when the employee was last updated',
    example: '2024-01-20T14:45:00Z',
  })
  updated_at: Date;
}