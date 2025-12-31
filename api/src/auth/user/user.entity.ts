import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "../../employee/employee.entity";
import { UserStatus } from "./enums/user-status.enum";
import { UserRole } from "./enums/user-role.enum";

@Entity()
export class User {
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum', 
    enum: UserRole
  })
  role: UserRole;

  @OneToOne(() => Employee, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ nullable: false })
  employee_id: string;

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