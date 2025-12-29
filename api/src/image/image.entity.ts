import { CollectionPoints } from "../collection-points/collection-points.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Route } from "../route/route.entity";
import { ImageStatus } from "./enums/device-status.enum";
import { Complaints } from "../complaints/complaints.entity";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Image {
  @ApiProperty({
    description: 'Unique identifier for the image',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @Column('char', { primary: true, length: 36, generated: 'uuid' })
  image_id: string;

  @ApiProperty({
    description: 'Associated route information',
    type: () => Route
  })
  @ManyToOne(() => Route, (route) => route.images,{ nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @ApiProperty({
    description: 'List of complaints associated with this image',
    type: () => [Complaints]
  })
  @OneToMany(() => Complaints, complaints => complaints.image)
  complaints: Complaints[];

  @ApiProperty({
    description: 'URL of the stored image',
    example: 'https://storage.example.com/images/sample.jpg'
  })
  @Column({nullable : false})
  image_url: string;

  @ApiProperty({
    description: 'Original filename of the image',
    example: 'sample-image.jpg'
  })
  @Column({nullable : false})
  file_name: string;

  @ApiProperty({
    description: 'Current status of the image',
    enum: ImageStatus,
    default: ImageStatus.ACTIVE,
    example: ImageStatus.ACTIVE
  })
  @Column({
      type: 'enum',
      enum: ImageStatus,
      default: ImageStatus.ACTIVE,
  })
  status: ImageStatus;
}