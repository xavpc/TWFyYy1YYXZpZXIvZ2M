import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}
  
  async create(createUserDto: { username: string, password: string, employee_id: string }) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.userRepository.create({
      username: createUserDto.username,
      hashed_password: hashedPassword,
      employee_id: createUserDto.employee_id
    });

    return this.userRepository.save(user);
  }

  async validatePassword(username: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) return false;

    return bcrypt.compare(password, user.hashed_password);
  }
}