import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { STRONG_PASSWORD } from '../utils/regex';
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
export class UpdateUserDto extends PartialType(CreateUserDto) {}
