import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './enums/user-status.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username }
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const existingEmployee = await this.userRepository.findOne({
      where: { employee_id: createUserDto.employee_id }
    });

    if (existingEmployee) {
      throw new ConflictException('Employee already has a user account');
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const newUser = this.userRepository.create({
      ...createUserDto,
      hashed_password: hashedPassword,
      status: UserStatus.ACTIVE
    });

    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['user_id', 'username', 'role', 'status', 'employee_id'],
      relations: ['employee']
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
      select: ['user_id', 'username', 'role', 'status', 'employee_id'],
      relations: ['employee']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['employee']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username: updateUserDto.username }
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    if (updateUserDto.password) {
      const hashedPassword = await this.hashPassword(updateUserDto.password);
      user.hashed_password = hashedPassword;
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = status;
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { user_id: id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.hashed_password = await this.hashPassword(newPassword);
    await this.userRepository.save(user);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}