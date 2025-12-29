import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserStatus } from "./enums/user-status.enum";
import { UserRole } from "./enums/user-role.enum";
import { Employee } from "../../employee/employee.entity";

@Entity()
export class Users {
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum', 
    enum: UserRole
  })
  role: UserRole;


  @OneToOne(() => Employee, employee => employee.user)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: false })
  hashed_password: string;

  @Column({
      type: 'enum', 
      enum: UserStatus,
      default: UserStatus.ACTIVE,
  })
  status: UserStatus;
}