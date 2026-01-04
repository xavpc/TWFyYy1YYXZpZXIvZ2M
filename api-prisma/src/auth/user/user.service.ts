import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Users } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './enums/user-status.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<Users> {
    const existingUser = await this.prisma.users.findFirst({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    if (createUserDto.employee_id) {
      const existingUserWithEmployee = await this.prisma.users.findFirst({
        where: { employee_id: createUserDto.employee_id },
      });

      if (existingUserWithEmployee) {
        throw new ConflictException('Employee already has a user account');
      }
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    return this.prisma.users.create({
      data: {
        username: createUserDto.username,
        hashed_password: hashedPassword,
        role: createUserDto.role,
        status: UserStatus.active,
        ...(createUserDto.employee_id && {
          employee: { connect: { employee_id: createUserDto.employee_id } },
        }),
      },
      include: { employee: true },
    });
  }

  async findAll(): Promise<Partial<Users>[]> {
    return this.prisma.users.findMany({
      select: {
        user_id: true,
        username: true,
        role: true,
        status: true,
        employee: true,
      },
    });
  }

  async findOne(id: string): Promise<Partial<Users>> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        username: true,
        role: true,
        status: true,
        employee: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Users not found');
    }

    return user;
  }

  async findByUsername(username: string): Promise<Users> {
    const user = await this.prisma.users.findFirst({
      where: { username },
      include: { employee: true },
    });

    if (!user) {
      throw new NotFoundException('Users not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Users> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: id },
    });

    if (!user) {
      throw new NotFoundException('Users not found');
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.prisma.users.findFirst({
        where: { username: updateUserDto.username },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    const { password, ...otherData } = updateUserDto;
    let hashedPassword: string | undefined;

    if (password) {
      hashedPassword = await this.hashPassword(password);
    }

    return this.prisma.users.update({
      where: { user_id: id },
      data: {
        ...otherData,
        ...(hashedPassword && { hashed_password: hashedPassword }),
      },
      include: { employee: true },
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: id },
    });

    if (!user) {
      throw new NotFoundException('Users not found');
    }

    await this.prisma.users.delete({
      where: { user_id: id },
    });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
