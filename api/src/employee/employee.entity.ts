import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../auth/user/user.entity';
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

  @Column({ nullable: true })
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

  @OneToOne(() => User, (user) => user.employee, {
    onDelete: 'CASCADE'
  })
  user: User;

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
}