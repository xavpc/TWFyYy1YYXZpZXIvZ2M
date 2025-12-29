import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './enums/user-status.enum';
import { UserRole } from './enums/user-role.enum';
// Import guards (commented out for now)
// import { JwtGuard } from '../security/guards/jwt.guard';
// import { RoleGuard } from '../security/guards/role.guard';
// import { Roles } from '../security/decorators/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  // @UseGuards(JwtGuard, RoleGuard)
  // @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    // For creating an admin user, you might want to explicitly set the role
    const adminUserDto: CreateUserDto = {
      ...createUserDto,
      role: UserRole.ADMIN // Ensure role is set to ADMIN
    };
    
    const user = await this.userService.create(adminUserDto);
    
    // Return user without sensitive data
    const { hashed_password, ...result } = user;
    return result;
  }

  @Get()
  // @UseGuards(JwtGuard)
  async findAll() {
    const users = await this.userService.findAll();
    return users;
  }

  @Get(':id')
  // @UseGuards(JwtGuard)
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  // @UseGuards(JwtGuard, RoleGuard)
  // @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    const { hashed_password, ...result } = user;
    return result;
  }

  @Put(':id/status')
  // @UseGuards(JwtGuard, RoleGuard)
  // @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    const user = await this.userService.updateStatus(id, status);
    const { hashed_password, ...result } = user;
    return result;
  }

  @Delete(':id')
  // @UseGuards(JwtGuard, RoleGuard)
  // @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return { message: 'User deleted successfully' };
  }

  @Post(':id/change-password')
  // @UseGuards(JwtGuard)
  async changePassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.userService.changePassword(id, newPassword);
    return { message: 'Password changed successfully' };
  }
}