import { IsString, IsInt, IsEmail, IsOptional, Min, Max, Matches, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { nameRegex, japanPhoneRegex, emailRegex } from '../utils/regex';
export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Matches(nameRegex, { 
    message: 'First name can only contain letters, spaces, hyphens and apostrophes' 
  })
  first_name: string;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Middle name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Middle name cannot exceed 50 characters' })
  @Matches(nameRegex, { 
    message: 'Middle name can only contain letters, spaces, hyphens and apostrophes' 
  })
  middle_name?: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(nameRegex, { 
    message: 'Last name can only contain letters, spaces, hyphens and apostrophes' 
  })
  last_name: string;

  @IsString()
  address: string;

  @IsString()
  @Matches(japanPhoneRegex, { 
    message: 'Please enter a valid Japanese phone number (e.g., 090-1234-5678 or +81 90-1234-5678)'
  })
  contact_number: string;

  @IsEmail({}, { message: 'Please enter a valid email address' })
  @Matches(emailRegex, { 
    message: 'Invalid email format. Example: john.doe@example.com' 
  })
  email: string;

  @IsInt()
  @Min(18)
  @Max(100)
  age: number;
}