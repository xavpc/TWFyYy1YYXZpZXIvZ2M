import { IsEnum, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';
import { STRONG_PASSWORD } from '../utils/regex';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'adminUser123'
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Strong password containing at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
    example: 'P@ssw0rd123',
    minLength: 8
  })
  @IsNotEmpty()
  @IsString()
  // @MinLength(8)
  // @Matches(STRONG_PASSWORD, {
  //   message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
  // })
  password: string;

  @ApiProperty({
    description: 'Employee ID associated with the user',
    example: 'b765e3fe-efd4-11ef-9da2-54ee75718d0f'
  })
  @IsNotEmpty()
  @IsString()
  employee_id: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    example: UserRole.admin,
    enum: UserRole
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
