import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Users } from './user.entity';
import { Employee } from '../../employee/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Employee]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}