import { IsString, IsInt, IsEmail, IsOptional, Min, Max, Matches, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { nameRegex, japanPhoneRegex, emailRegex } from '../utils/regex';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Employee\'s first name',
    example: 'Tonkutsu',
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: nameRegex.toString(), // Convert regex to string for Swagger
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Matches(nameRegex, { 
    message: 'First name can only contain letters, spaces, hyphens, and apostrophes' 
  })
  first_name: string;

  @ApiProperty({
    description: 'Employee\'s middle name (optional)',
    example: 'Ra',
    required: false,
    minLength: 2,
    maxLength: 50,
    pattern: nameRegex.toString(), // Convert regex to string for Swagger
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Middle name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Middle name cannot exceed 50 characters' })
  @Matches(nameRegex, { 
    message: 'Middle name can only contain letters, spaces, hyphens, and apostrophes' 
  })
  middle_name?: string;

  @ApiProperty({
    description: 'Employee\'s last name',
    example: 'Minu',
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: nameRegex.toString(), // Convert regex to string for Swagger
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(nameRegex, { 
    message: 'Last name can only contain letters, spaces, hyphens, and apostrophes' 
  })
  last_name: string;

  @ApiProperty({
    description: 'Employee\'s full address',
    example: '1-1-1 Shibuya, Shibuya-ku, Tokyo',
    required: true,
  })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Employee\'s Japanese phone number',
    example: '090-1234-5678',
    required: true,
    pattern: japanPhoneRegex.toString(), // Convert regex to string for Swagger
  })
  @IsString()
  // @Matches(japanPhoneRegex, { 
  //   message: 'Please enter a valid Japanese phone number (e.g., 090-1234-5678 or +81 90-1234-5678)'
  // })
  contact_number: string;

  @ApiProperty({
    description: 'Employee\'s email address',
    example: 'john.doe@example.com',
    required: true,
    pattern: emailRegex.toString(), // Convert regex to string for Swagger
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @Matches(emailRegex, { 
    message: 'Invalid email format. Example: john.doe@example.com' 
  })
  email: string;

  @ApiProperty({
    description: 'Employee\'s age (must be between 18 and 100)',
    example: 25,
    required: true,
    minimum: 18,
    maximum: 100,
  })
  @IsInt()
  @Min(18)
  @Max(100)
  age: number;
}