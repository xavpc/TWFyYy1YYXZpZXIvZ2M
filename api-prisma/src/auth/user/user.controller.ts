import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './enums/user-status.enum';
import { UserRole } from './enums/user-role.enum';
import { UserResponse, UserListResponse } from './dto/response.dto';

@ApiTags('Users') 
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponse })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const adminUserDto: CreateUserDto = {
      ...createUserDto,
      role: UserRole.admin,
    };

    const user = await this.userService.create(adminUserDto);

    const { hashed_password, ...result } = user;
    return { success: true, message: 'User created successfully', data: result };
  }

  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: UserListResponse })
  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return { success: true, message: 'Users retrieved successfully', data: users, total: users.length };
  }

  @ApiOperation({ summary: 'Retrieve a single user by ID' })
  @ApiResponse({ status: 200, description: 'User data retrieved successfully', type: UserResponse })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return { success: true, message: 'User retrieved successfully', data: user };
  }

  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponse })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    const { hashed_password, ...result } = user;
    return { success: true, message: 'User updated successfully', data: result };
  }


  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { success: true, message: 'User deleted successfully' };
  }


}
