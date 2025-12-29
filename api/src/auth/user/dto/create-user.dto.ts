import { IsString, IsNotEmpty, IsEnum, IsUUID, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { usernameRegex, passwordRegex } from '../utils/regex';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username for login',
    example: 'john.doe',
    pattern: usernameRegex.toString(),
    minLength: 3,
    maxLength: 30
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(30, { message: 'Username cannot exceed 30 characters' })
  @Matches(usernameRegex, {
    message: 'Username can only contain letters, numbers, dots, underscores, and hyphens'
  })
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongPass123',
    pattern: passwordRegex.toString(),
    minLength: 8
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(passwordRegex, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  password: string;

  @ApiProperty({
    description: 'Employee ID associated with the user',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  employee_id: string;

  @ApiProperty({
    enum: UserRole,
    description: 'Role of the user in the system',
    example: UserRole.GARBAGE_COLLECTOR
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({
    enum: UserStatus,
    description: 'Status of the user account',
    example: UserStatus.ACTIVE,
    required: false
  })
  @IsEnum(UserStatus)
  status?: UserStatus;
}