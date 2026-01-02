import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaints } from './complaints.entity';
import { CreateComplaintDto } from './dto/create-complaints.dto';
import { UpdateComplaintDto } from './dto/update-complaints.dto';
import { Image } from '../image/image.entity';
import { Device } from '../device/device.entity';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaints)
    private complaintsRepository: Repository<Complaints>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  async create(createComplaintDto: CreateComplaintDto): Promise<Complaints> {
    const image = await this.imageRepository.findOne({ where: { image_id: createComplaintDto.image_id }});
    if (!image) {
      throw new NotFoundException(`Image with ID ${createComplaintDto.image_id} not found`);
    }

    const device = await this.deviceRepository.findOne({ where: { device_id: createComplaintDto.device_id }});
    if (!device) {
      throw new NotFoundException(`Device with ID ${createComplaintDto.device_id} not found`);
    }

    const complaint = this.complaintsRepository.create({
      ...createComplaintDto,
      complaint_timestamp: new Date(createComplaintDto.complaint_timestamp), // Convert string to Date
      image,
      device,
    });

    return this.complaintsRepository.save(complaint);
  }

  async findAll(): Promise<Complaints[]> {
    return this.complaintsRepository.find({
      relations: ['image', 'device'],
    });
  }

  async findOne(complaint_id: string): Promise<Complaints> {
    const complaint = await this.complaintsRepository.findOne({
      where: { complaint_id },
      relations: ['image', 'device'],
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint with ID ${complaint_id} not found`);
    }

    return complaint;
  }

  async update(complaint_id: string, updateComplaintDto: UpdateComplaintDto): Promise<Complaints> {
    const complaint = await this.findOne(complaint_id);

    if (updateComplaintDto.image_id) {
      const image = await this.imageRepository.findOne({ where: { image_id: updateComplaintDto.image_id }});
      if (!image) {
        throw new NotFoundException(`Image with ID ${updateComplaintDto.image_id} not found`);
      }
      complaint.image = image;
    }

    if (updateComplaintDto.device_id) {
      const device = await this.deviceRepository.findOne({ where: { device_id: updateComplaintDto.device_id }});
      if (!device) {
        throw new NotFoundException(`Device with ID ${updateComplaintDto.device_id} not found`);
      }
      complaint.device = device;
    }

    Object.assign(complaint, updateComplaintDto);
    return this.complaintsRepository.save(complaint);
  }

  async remove(complaint_id: string): Promise<void> {
    const complaint = await this.findOne(complaint_id);
    await this.complaintsRepository.remove(complaint);
  }
}