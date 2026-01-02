import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { DeviceSession } from './device-session.entity';
import { CreateDeviceSessionDto } from './dto/device-session-create.dto';
import { UpdateDeviceSessionDto } from './dto/device-sessoin-update.dto';

@Injectable()
export class DeviceSessionService {
  constructor(
    @InjectRepository(DeviceSession)
    private deviceSessionRepository: Repository<DeviceSession>,
  ) {}

  async create(createDeviceSessionDto: CreateDeviceSessionDto): Promise<DeviceSession> {
    const deviceSession = this.deviceSessionRepository.create({
      ...createDeviceSessionDto,
      start: new Date(), 
    });
    return await this.deviceSessionRepository.save(deviceSession);
  }


  async findAll(): Promise<DeviceSession[]> {
    return await this.deviceSessionRepository.find();
  }


  async findOne(session_id: string): Promise<DeviceSession> {
    const session = await this.deviceSessionRepository.findOne({ 
      where: { session_id },
      relations: ['device_locations'] 
    });
    
    if (!session) {
      throw new NotFoundException(`Device Session with ID ${session_id} not found`);
    }
    
    return session;
  }


  async endSession(session_id: string): Promise<DeviceSession> {
    const session = await this.findOne(session_id);
    
    if (session.end) {
      throw new NotFoundException(`Session ${session_id} is already ended`);
    }
    
    session.end = new Date();
    return await this.deviceSessionRepository.save(session);
  }


  async remove(session_id: string): Promise<DeviceSession> {
    const session = await this.findOne(session_id);
    return await this.deviceSessionRepository.remove(session);
  }




}