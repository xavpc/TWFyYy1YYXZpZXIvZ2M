import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { DeviceSession } from './device-session.entity';
import { CreateDeviceSessionDto } from './dto/device-session-create.dto';
import { UpdateDeviceSessionDto } from './dto/device-session-update.dto';
import { Route } from '../route/route.entity';

@Injectable()
export class DeviceSessionService {
  constructor(
    @InjectRepository(DeviceSession)
    private deviceSessionRepository: Repository<DeviceSession>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
  ) {}

  async create(createDeviceSessionDto: CreateDeviceSessionDto): Promise<DeviceSession> {
    const route = await this.routeRepository.findOne({
      where: { route_id: createDeviceSessionDto.route_id }
    });
    
    if (!route) {
      throw new NotFoundException(
        `Route with ID ${createDeviceSessionDto.route_id} not found`
      );
    }
    
    const deviceSession = this.deviceSessionRepository.create({
      ...createDeviceSessionDto,
      route: route,
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

  async findByDeviceId(device_id: string): Promise<DeviceSession[]> {
    return await this.deviceSessionRepository
      .createQueryBuilder('session')
      .innerJoinAndSelect(
        'session.device_locations', 
        'device_locations'
      )
      .innerJoin(
        'device_locations.device',
        'device',
        'device.device_id = :device_id',
        { device_id }
      )
      .distinct(true)
      .getMany();
  }

  async findActiveSessionByDeviceId(device_id: string): Promise<DeviceSession | null> {
    const session = await this.deviceSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.device_locations', 'device_locations')
      .where('device_locations.device_id = :device_id', { device_id })
      .andWhere('session.end IS NULL')
      .getOne();
    
    return session;
  }

  async update(
    session_id: string, 
    updateDeviceSessionDto: UpdateDeviceSessionDto
  ): Promise<DeviceSession> {
    const session = await this.findOne(session_id);
    
    const updatedSession = await this.deviceSessionRepository.save({
      ...session,
      ...updateDeviceSessionDto,
    });
    
    return updatedSession;
  }

  async endSession(session_id: string): Promise<DeviceSession> {
    const session = await this.findOne(session_id);
    
    if (session.end) {
      throw new NotFoundException(`Session ${session_id} is already ended`);
    }
    
    session.end = new Date();
    return await this.deviceSessionRepository.save(session);
  }

  async endActiveSessionByDeviceId(device_id: string): Promise<DeviceSession | null> {
    const activeSession = await this.findActiveSessionByDeviceId(device_id);
    
    if (!activeSession) {
      return null;
    }
    
    activeSession.end = new Date();
    return await this.deviceSessionRepository.save(activeSession);
  }

  async remove(session_id: string): Promise<DeviceSession> {
    const session = await this.findOne(session_id);
    return await this.deviceSessionRepository.remove(session);
  }

  async findActiveSessions(): Promise<DeviceSession[]> {
    return await this.deviceSessionRepository.find({
      where: { end: IsNull() },
    });
  }

  async findSessionsByDate(
    date: Date
  ): Promise<DeviceSession[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await this.deviceSessionRepository
      .createQueryBuilder('session')
      .where('session.start BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })
      .getMany();
  }

  findByRoute(routeId: string): Promise<DeviceSession[]> {
    return this.deviceSessionRepository.find({
      where: { route: { route_id: routeId } },
      relations: ['route']
    });
  }
}