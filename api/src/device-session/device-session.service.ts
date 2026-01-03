import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, IsNull, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { DeviceSession } from './device-session.entity';
import { CreateDeviceSessionDto } from './dto/device-session-create.dto';
import { UpdateDeviceSessionDto } from './dto/device-session-update.dto';
import { DeviceRoute } from '../device-route/device-route.entity';
import { Reports } from '../reports/reports.entity';

@Injectable()
export class DeviceSessionService {
  constructor(
    @InjectRepository(DeviceSession)
    private deviceSessionRepository: Repository<DeviceSession>,
    @InjectRepository(DeviceRoute)
    private deviceRouteRepository: Repository<DeviceRoute>,
    @InjectRepository(Reports)
    private reportRepository: Repository<Reports>,
  ) {}

  async create(createDeviceSessionDto: CreateDeviceSessionDto): Promise<DeviceSession> {
    const device_route = await this.deviceRouteRepository.findOne({
      where: { device_route_id: createDeviceSessionDto.device_route_id }
    });
    
    if (!device_route) {
      throw new NotFoundException(
        `Device Route with ID ${createDeviceSessionDto.device_route_id} not found`
      );
    }
    
    const deviceSession = this.deviceSessionRepository.create({
      ...createDeviceSessionDto,
      device_route: device_route,
      start: new Date(), 
    });
    return await this.deviceSessionRepository.save(deviceSession);
  }

  async findAll(): Promise<DeviceSession[]> {
    return await this.deviceSessionRepository.find({
      relations: ['device_route', 'device_route.device', 'device_route.route']
    });
  }

  
  async findOne(session_id: string): Promise<DeviceSession> {
    const session = await this.deviceSessionRepository.findOne({ 
      where: { session_id },
      relations: ['device_route', 'device_route.device', 'device_route.route']
    });
    
    if (!session) {
      throw new NotFoundException(`Device Session with ID ${session_id} not found`);
    }
    
    return session;
  }

  async findByDeviceId(
    device_id: string,
    getActive: boolean = false
  ): Promise<DeviceSession[]> {
    const query = this.deviceSessionRepository
      .createQueryBuilder('session')
      .innerJoinAndSelect('session.device_route', 'device_route')
      .leftJoinAndSelect('device_route.device', 'device_route_device')
      .leftJoinAndSelect('device_route.route', 'device_route_route')
      .innerJoinAndSelect(
        'session.device_locations', 
        'device_locations'
      )
      .innerJoin(
        'device_locations.device',
        'device',
        'device.device_id = :device_id',
        { device_id }
      );
    

    if (getActive) {
      query.andWhere('session.end IS NULL');
    } else {
      query.andWhere('session.end IS NOT NULL');
    }
    
    query.distinct(true);
    
    return await query.getMany();
  }

  async findActiveSessionByDeviceId(device_id: string): Promise<DeviceSession | null> {
    const session = await this.deviceSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.device_route', 'device_route')
      .leftJoinAndSelect('device_route.device', 'device_route_device')
      .leftJoinAndSelect('device_route.route', 'device_route_route')
      .where('device_route.device_id = :device_id', { device_id })
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
      relations: ['device_route', 'device_route.device', 'device_route.route']
    });
  }

  async findSessionsByDate(
    date: Date,
    deviceId?: string,
    getActive: boolean = false
  ): Promise<DeviceSession[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const query = this.deviceSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.device_route', 'device_route')
      .leftJoinAndSelect('device_route.device', 'device_route_device')
      .leftJoinAndSelect('device_route.route', 'device_route_route')
      .where('session.start BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay });
    

    if (getActive) {
      query.andWhere('session.end IS NULL');
    } else {
      query.andWhere('session.end IS NOT NULL');
    }
    
    if (deviceId) {
      query.innerJoin('session.device_locations', 'device_locations')
           .andWhere('device_locations.device_id = :deviceId', { deviceId });
    }
    
    return await query.getMany();
  }
  

  findByDeviceRoute(
    deviceRouteId: string, 
    deviceId?: string, 
    getActive: boolean = false
  ): Promise<DeviceSession[]> {
    const query = this.deviceSessionRepository.createQueryBuilder('session')
      .leftJoinAndSelect('session.device_route', 'device_route')
      .leftJoinAndSelect('device_route.device', 'device_route_device')
      .leftJoinAndSelect('device_route.route', 'device_route_route')
      .where('device_route.device_route_id = :deviceRouteId', { deviceRouteId });
    
    if (getActive) {
      query.andWhere('session.end IS NULL');
    } else {
      query.andWhere('session.end IS NOT NULL');
    }
    
    if (deviceId) {
      query.innerJoin('session.device_locations', 'device_locations')
           .andWhere('device_locations.device_id = :deviceId', { deviceId });
    }
    
    return query.getMany();
  }
  
  

  async findSessionsByRouteAndDate(
    deviceRouteId: string,
    date: Date,
    deviceId?: string,
    getActive: boolean = false
  ): Promise<DeviceSession[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const query = this.deviceSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.device_route', 'device_route')
      .leftJoinAndSelect('device_route.device', 'device_route_device')
      .leftJoinAndSelect('device_route.route', 'device_route_route')
      .where('device_route.device_route_id = :deviceRouteId', { deviceRouteId })
      .andWhere('session.start BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay });
    
    if (getActive) {
      query.andWhere('session.end IS NULL');
    } else {
      query.andWhere('session.end IS NOT NULL');
    }
    
    if (deviceId) {
      query.innerJoin('session.device_locations', 'device_locations')
           .andWhere('device_locations.device_id = :deviceId', { deviceId });
    }
    
    return await query.getMany();
  }

  async removeAll(): Promise<DeviceSession[]> {
    const sessions = await this.deviceSessionRepository.find();
    return await this.deviceSessionRepository.remove(sessions);
  }


  async findRecentlyEndedSessions(lookbackHours = 24): Promise<DeviceSession[]> {
    const lookbackDate = new Date();
    lookbackDate.setHours(lookbackDate.getHours() - lookbackHours);
    
    return this.deviceSessionRepository.find({
      where: {
        end: And(Not(IsNull()), MoreThanOrEqual(lookbackDate)), // Only recent completed sessions
      },
      relations: [
        'device_route',
        'device_route.route',
        'device_route.device',
        'device_route.device.employee'
      ],
      order: {
        end: 'DESC', 
      },
    });
  }
  

  async sessionHasReport(session_id: string): Promise<boolean> {
    const reportCount = await this.reportRepository.count({
      where: {
        session: { session_id }
      }
    });
    
    return reportCount > 0;
  }

}