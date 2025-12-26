import { Entity, Column } from 'typeorm';

@Entity()
export class Route {
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  route_id: string;

  @Column({ nullable: false })
  route_name: string;

}