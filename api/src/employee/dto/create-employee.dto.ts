import { IsString, IsInt, IsEmail, IsOptional, Min, Max, Matches, IsNotEmpty, MinLength, MaxLength, IsDate, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { nameRegex, japanPhoneRegex, emailRegex, postalCodeRegex, myNumberRegex, socialInsuranceRegex } from '../utils/regex';
import { ValidateIf } from 'class-validator';
import { EmployeeStatus } from '../enums/employee-status.enum';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Employee\'s first name (名)',
    example: 'Takeshi',
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: nameRegex.toString()
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  // @Matches(nameRegex, { 
  //   message: 'First name can only contain letters, spaces, hyphens, and apostrophes' 
  // })
  first_name: string;

  @ApiProperty({
    description: 'Employee\'s middle name',
    example: 'Yuji',
    required: false,
    minLength: 2,
    maxLength: 50,
    pattern: nameRegex.toString()
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o, value) => value !== '')  
  @MinLength(2, { message: 'Middle name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Middle name cannot exceed 50 characters' })
  // @Matches(nameRegex, { 
  //   message: 'Middle name can only contain letters, spaces, hyphens, and apostrophes' 
  // })
  middle_name?: string;

  @ApiProperty({
    description: 'Employee\'s last name (姓)',
    example: 'Sato',
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: nameRegex.toString()
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  // @Matches(nameRegex, { 
  //   message: 'Last name can only contain letters, spaces, hyphens, and apostrophes' 
  // })
  last_name: string;

  @ApiProperty({
    description: 'Address of the employee',
    example: 'Shibuya 1-2-3, Shibuya-ku, Tokyo',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({
    description: 'Postal code (郵便番号)',
    example: '150-0002',
    required: false,
    pattern: postalCodeRegex.toString()
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o, value) => value !== '')
  @Matches(postalCodeRegex, {
    message: 'Please enter a valid Japanese postal code (e.g., 150-0002)'
  })
  postal_code?: string;

  @ApiProperty({
    description: 'Contact number of the employee',
    example: '090-1234-5678',
    required: true,
    pattern: japanPhoneRegex.toString()
  })
  @IsString()
  @IsNotEmpty({ message: 'Contact number is required' })
  @Matches(japanPhoneRegex, { 
    message: 'Please enter a valid Japanese phone number (e.g., 090-1234-5678 or +81 90-1234-5678)'
  })
  contact_number: string;

  @ApiProperty({
    description: 'Emergency contact number (緊急連絡先)',
    example: '03-1234-5678',
    required: false,
    pattern: japanPhoneRegex.toString()
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o, value) => value !== '')
  @Matches(japanPhoneRegex, { 
    message: 'Please enter a valid Japanese phone number'
  })
  emergency_contact?: string;

  @ApiProperty({
    description: 'Email address of the employee',
    example: 't.sato@example.com',
    required: true,
    pattern: emailRegex.toString()
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Matches(emailRegex, { 
    message: 'Invalid email format' 
  })
  email: string;

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
    description: 'Date of birth (生年月日)',
    example: '1993-05-15',
    required: true
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: 'Date of birth is required' })
  date_of_birth: Date;

  @ApiProperty({
    description: 'Employment start date (入社日)',
    example: '2023-04-01',
    required: true
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: 'Employment start date is required' })
  employment_start_date: Date;

  @ApiProperty({
    description: 'Employee number (社員番号)',
    example: 'EMP2024001',
    required: false
  })
  @IsString()
  @IsOptional()
  employee_number?: string;

  @ApiProperty({
    description: 'Department/Division (部署)',
    example: '清掃部',
    required: false
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    description: 'Position/Title (役職)',
    example: '主任',
    required: false
  })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({
    description: 'Social Insurance Number (社会保険番号)',
    example: '1234567890',
    required: false,
    pattern: socialInsuranceRegex.toString()
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o, value) => value !== '')
  @Matches(socialInsuranceRegex, {
    message: 'Please enter a valid social insurance number.. example: `1234567890`'
  })
  social_insurance_number?: string;

  @ApiProperty({
    description: 'My Number (マイナンバー)',
    example: '123456789012',
    required: false,
    pattern: myNumberRegex.toString()
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o, value) => value !== '')
  @Matches(myNumberRegex, {
    message: 'Please enter a valid My Number (12 digits)'
  })
  my_number?: string;

  @ApiProperty({
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
    description: 'Employee status'
  })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}