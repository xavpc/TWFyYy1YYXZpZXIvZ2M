import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Route {
  @PrimaryGeneratedColumn('uuid')
  route_id: string;

  @Column({ nullable: false })
  route_name: string;

}