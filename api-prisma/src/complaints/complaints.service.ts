import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Complaints, Prisma } from '@prisma/client';
import { CreateComplaintDto } from './dto/create-complaints.dto';
import { UpdateComplaintDto } from './dto/update-complaints.dto';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  async create(createComplaintDto: CreateComplaintDto): Promise<Complaints> {
    const existingTitle = await this.prisma.complaints.findUnique({
      where: { title: createComplaintDto.title }
    });

    if (existingTitle) {
      throw new ConflictException(
        `Title '${createComplaintDto.title}' already exists`
      );
    }

    const image = await this.prisma.image.findUnique({
      where: { image_id: createComplaintDto.image_id }
    });
    if (!image) {
      throw new NotFoundException(`Image with ID ${createComplaintDto.image_id} not found`);
    }

    const device = await this.prisma.device.findUnique({
      where: { device_id: createComplaintDto.device_id }
    });
    if (!device) {
      throw new NotFoundException(`Device with ID ${createComplaintDto.device_id} not found`);
    }

    try {
      return await this.prisma.complaints.create({
        data: {
          title: createComplaintDto.title,
          description: createComplaintDto.description,
          latitude: createComplaintDto.latitude,
          longitude: createComplaintDto.longitude,
          complaint_timestamp: new Date(createComplaintDto.complaint_timestamp),
          image_id: createComplaintDto.image_id,
          device_id: createComplaintDto.device_id,
        },
        include: { device: true, image: true }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Title '${createComplaintDto.title}' already exists`
          );
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<Complaints[]> {
    return this.prisma.complaints.findMany({
      include: {
        image: true,
        device: true
      }
    });
  }

  async findOne(complaint_id: string): Promise<Complaints & { image: any; device: any }> {
    const complaint = await this.prisma.complaints.findUnique({
      where: { complaint_id },
      include: {
        image: true,
        device: true
      }
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint with ID ${complaint_id} not found`);
    }

    return complaint;
  }

  async update(complaint_id: string, updateComplaintDto: UpdateComplaintDto): Promise<Complaints> {
    await this.findOne(complaint_id);

    if (updateComplaintDto.image_id) {
      const image = await this.prisma.image.findUnique({
        where: { image_id: updateComplaintDto.image_id }
      });
      if (!image) {
        throw new NotFoundException(`Image with ID ${updateComplaintDto.image_id} not found`);
      }
    }

    if (updateComplaintDto.device_id) {
      const device = await this.prisma.device.findUnique({
        where: { device_id: updateComplaintDto.device_id }
      });
      if (!device) {
        throw new NotFoundException(`Device with ID ${updateComplaintDto.device_id} not found`);
      }
    }

    return this.prisma.complaints.update({
      where: { complaint_id },
      data: updateComplaintDto
    });
  }

  async remove(complaint_id: string): Promise<void> {
    await this.findOne(complaint_id);

    await this.prisma.complaints.delete({
      where: { complaint_id }
    });
  }
}
