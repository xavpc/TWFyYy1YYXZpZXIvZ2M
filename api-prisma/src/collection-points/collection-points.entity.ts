import { CollectedPoints } from "../collected-points/collected-points.entity";
import { Route } from "../route/route.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class CollectionPoints {
  @ApiProperty({
    description: 'Unique identifier for the collection point',
    format: 'uuid'
  })
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  collection_point_id: string;

  @ApiProperty({
    description: 'sequence of the collection point',
    example: 1
  })
  @Column({
    type: 'int',
    nullable: false
  })
  sequence: number;


  @ApiProperty({
    description: 'The associated route',
    type: () => Route
  })
  @ManyToOne(() => Route, (route) => route.collection_points, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @ApiProperty({
    description: 'The collected points associated with this collection point',
    type: () => [CollectedPoints]
  })
  @OneToMany(() => CollectedPoints, (collected_point) => collected_point.collection_point)
  collected_points: CollectedPoints[];

  @ApiProperty({
    description: 'Name of the collection point',
    example: 'Downtown Collection Point'
  })
  @Column({ nullable: false, unique: false })
  collection_point_name: string;

  @ApiProperty({
    description: 'Latitude coordinate of the collection point',
    example: 40.712776,
    minimum: -90,
    maximum: 90
  })
  @Column('decimal', { precision: 8, scale: 6 })
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of the collection point',
    example: -74.005974,
    minimum: -180,
    maximum: 180
  })
  @Column('decimal', { precision: 9, scale: 6 })
  longitude: number;
}