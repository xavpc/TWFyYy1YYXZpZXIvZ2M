import { IsString, IsInt, IsEmail, IsOptional, Min, Max, IsNotEmpty, MinLength, MaxLength, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { nameRegex, japanPhoneRegex, emailRegex } from '../utils/regex';
import { EmployeeStatus } from '../enums/employee-status.enum';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Employee\'s first name (名)',
    example: 'Takeshi',
    required: true,
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  first_name: string;

  @ApiProperty({
    description: 'Employee\'s middle name',
    example: 'Yuji',
    required: false,
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Middle name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Middle name cannot exceed 50 characters' })
  middle_name?: string;

  @ApiProperty({
    description: 'Employee\'s last name (姓)',
    example: 'Sato',
    required: true,
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  last_name: string;

  @ApiProperty({
    description: 'Email address of the employee',
    example: 't.sato@example.com',
    required: true
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Contact number of the employee',
    example: '090-1234-5678',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Contact number is required' })
  // @Matches(japanPhoneRegex, { 
  //   message: 'Please enter a valid Japanese phone number (e.g., 090-1234-5678)'
  // })
  contact_number: string;

  @ApiProperty({
    description: 'Address of the employee',
    example: 'Shibuya 1-2-3, Shibuya-ku, Tokyo',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({
    description: 'Age of the employee',
    example: 30,
    required: true,
    minimum: 18,
    maximum: 100
  })
  @IsInt()
  @Min(18, { message: 'Employee must be at least 18 years old' })
  @Max(100, { message: 'Employee age cannot exceed 100 years' })
  age: number;

  @ApiProperty({
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
    description: 'Employee status(not required, but can be initialized at post)'
  })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}