import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm';
import { Device } from '../device/device.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../auth/user/user.entity';
import { EmployeeStatus } from './enums/employee-status.enum';

@Entity()
export class Employee {
  @ApiProperty({
    description: 'Unique employee ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
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
    description: 'Address of the employee',
    example: 'Shibuya 1-2-3, Shibuya-ku, Tokyo',  
  })
  address: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Postal code (郵便番号)',
    example: '150-0002',  
  })
  postal_code: string;

  @Column({ nullable: false })
  @ApiProperty({
    description: 'Contact number of the employee',
    example: '090-1234-5678',  
  })
  contact_number: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Emergency contact number (緊急連絡先)',
    example: '03-1234-5678',  
  })
  emergency_contact: string;

  @Column({ nullable: false })
  @ApiProperty({
    description: 'Email address of the employee',
    example: 't.sato@example.com', 
  })
  email: string;

  @Column('int', { nullable: false })
  @ApiProperty({
    description: 'Age of the employee',
    example: 30,  
  })
  age: number;

  @Column({ nullable: false })
  @ApiProperty({
    description: 'Date of birth (生年月日)',
    example: '1993-05-15',
  })
  date_of_birth: Date;

  @Column({ nullable: false })
  @ApiProperty({
    description: 'Employment start date (入社日)',
    example: '2023-04-01',
  })
  employment_start_date: Date;

  // company-specific unique identifier for each employee. need to be huma n readable
  @Column({ nullable: true })
  @ApiProperty({
    description: 'Employee number (社員番号)',
    example: 'EMP2024001',
  })
  employee_number: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Department/Division (部署)',
    example: '清掃部',
  })
  department: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Position/Title (役職)',
    example: '主任',
  })
  position: string;

  //for benefits and stuff
  @Column({ nullable: true })
  @ApiProperty({
    description: 'Social Insurance Number (社会保険番号)',
    example: '1234567890',
  })
  social_insurance_number: string;

  //japans national id number
  @Column({ nullable: true })
  @ApiProperty({
    description: 'My Number (マイナンバー)',
    example: '123456789012',
  })
  my_number: string;

  @OneToOne(() => User, (user) => user.employee, {
    onDelete: 'CASCADE'
  })
  user: User;

    @Column({
        type: 'enum', 
        enum: EmployeeStatus,
        default: EmployeeStatus.ACTIVE,
    })
    status: EmployeeStatus;
}