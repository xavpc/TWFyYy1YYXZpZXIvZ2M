import { IsString, IsInt, IsEmail, IsOptional, Min, Max, Matches, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { nameRegex, japanPhoneRegex, emailRegex } from '../utils/regex';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ 
    description: 'Employee\'s first name',
    example: 'John',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2)
  @MaxLength(50)
  @Matches(nameRegex)
  first_name: string;

  @ApiPropertyOptional({ 
    description: 'Employee\'s middle name',
    example: 'William',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @Matches(nameRegex)
  middle_name?: string;

  // Add similar decorators for other properties
  @ApiProperty({
    description: 'Employee\'s last name',
    example: 'Doe'
  })
  last_name: string;

  @ApiProperty({
    description: 'Employee\'s full address',
    example: '1-1-1 Shibuya, Shibuya-ku, Tokyo'
  })
  address: string;

  @ApiProperty({
    description: 'Japanese phone number',
    example: '090-1234-5678'
  })
  contact_number: string;

  @ApiProperty({
    description: 'Employee\'s email address',
    example: 'john.doe@company.com'
  })
  email: string;

  @ApiProperty({
    description: 'Employee\'s age',
    minimum: 18,
    maximum: 100,
    example: 25
  })
  age: number;
}