import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './image.entity';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async findAll(): Promise<Image[]> {
    return this.imageRepository.find({
      relations: ['route'], // Include route relation if needed
    });
  }

  async findOne(id: string): Promise<Image> {
    const image = await this.imageRepository.findOne({
        where: { image_id: id },
        relations: ['route'],
      });
    if (!image) {
        throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return image;
  }

  async findByRouteId(routeId: string): Promise<Image[]> {
    return this.imageRepository.find({
      where: { route: { route_id: routeId } },
      relations: ['route'],
    });
  }

  async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
    const image = await this.findOne(id);
    
    Object.assign(image, updateImageDto);
    
    return this.imageRepository.save(image);
  }
}