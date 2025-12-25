import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  employee_id: string;

  @Column({ nullable: false }) 
  first_name: string;

  @Column({ nullable: true })
  middle_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: false })
  contact_number: string;

  @Column({ nullable: false })
  email: string;

  @Column('int', { nullable: false })
  age: number;
}