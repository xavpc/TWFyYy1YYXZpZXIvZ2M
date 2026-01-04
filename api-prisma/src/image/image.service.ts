import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Image } from '@prisma/client';
import { UpdateImageDto } from './dto/update-image.dto';

@Injectable()
export class ImageService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Image[]> {
    return this.prisma.image.findMany({
      include: { route: true },
    });
  }

  async findOne(id: string): Promise<Image & { route: any }> {
    const image = await this.prisma.image.findUnique({
      where: { image_id: id },
      include: { route: true },
    });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return image;
  }

  async findByRouteId(routeId: string): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: { route_id: routeId },
      include: { route: true },
    });
  }

  async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
    await this.findOne(id);

    return this.prisma.image.update({
      where: { image_id: id },
      data: updateImageDto,
    });
  }
}
