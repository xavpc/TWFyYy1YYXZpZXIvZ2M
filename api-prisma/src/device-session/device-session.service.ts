import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, IsNull, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { DeviceSession } from './device-session.entity';
import { CreateDeviceSessionDto } from './dto/device-session-create.dto';
import { UpdateDeviceSessionDto } from './dto/device-session-update.dto';
import { DeviceRoute } from '../device-route/device-route.entity';
import { Reports } from '../reports/reports.entity';
import { FilterDeviceSessionDto } from './dto/device-session-filter.dto';

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

  async findAll(filterDto?: FilterDeviceSessionDto): Promise<{ data: DeviceSession[], total: number }> {
    if (!filterDto) {
      const data = await this.deviceSessionRepository.find({
        relations: [
          'device_route',
          'device_route.device',
          'device_route.device.employee',
          'device_route.route'
        ],
        order: { start: 'DESC' }
      });
      return { data, total: data.length };
    }

    const {
      session_id,
      device_route_id,
      device_id,
      route_id,
      employee_id,
      start_date,
      end_date,
      date,
      is_active,
      has_report,
      started_after,
      started_before,
      ended_after,
      ended_before,
      device_name,
      vehicle_plate_num,
      employee_name,
      employee_email,
      route_name,
      search,
      page = 1,
      limit = 10,
      sort_by = 'start',
      sort_order = 'DESC'
    } = filterDto;

    const skip = (page - 1) * limit;
    
    // Build the query
    let query = this.deviceSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.device_route', 'device_route')
      .leftJoinAndSelect('device_route.device', 'device')
      .leftJoinAndSelect('device.employee', 'employee')
      .leftJoinAndSelect('device_route.route', 'route')
      .leftJoinAndSelect('session.reports', 'reports');

    // Handle global search first
    if (search) {
      query.andWhere(`(
        session.session_id LIKE :search OR
        device.device_name LIKE :search OR
        device.vehicle_plate_num LIKE :search OR
        device.device_id LIKE :search OR
        route.route_name LIKE :search OR
        employee.first_name LIKE :search OR
        employee.last_name LIKE :search OR
        employee.email LIKE :search OR
        employee.employee_id LIKE :search
      )`, { search: `%${search}%` });
    }

    // Apply individual filters
    if (session_id) {
      query.andWhere('session.session_id LIKE :session_id', { session_id: `%${session_id}%` });
    }

    if (device_route_id) {
      query.andWhere('device_route.device_route_id = :device_route_id', { device_route_id });
    }

    if (device_id) {
      query.andWhere('device.device_id = :device_id', { device_id });
    }

    if (route_id) {
      query.andWhere('route.route_id = :route_id', { route_id });
    }

    if (employee_id) {
      query.andWhere('employee.employee_id = :employee_id', { employee_id });
    }

    // Device info filters
    if (device_name) {
      query.andWhere('device.device_name LIKE :device_name', { device_name: `%${device_name}%` });
    }

    if (vehicle_plate_num) {
      query.andWhere('device.vehicle_plate_num LIKE :vehicle_plate_num', { vehicle_plate_num: `%${vehicle_plate_num}%` });
    }

    if (route_name) {
      query.andWhere('route.route_name LIKE :route_name', { route_name: `%${route_name}%` });
    }

    // Employee info filters
    if (employee_name) {
      query.andWhere('(employee.first_name LIKE :employee_name OR employee.last_name LIKE :employee_name)', 
        { employee_name: `%${employee_name}%` });
    }

    if (employee_email) {
      query.andWhere('employee.email LIKE :employee_email', { employee_email: `%${employee_email}%` });
    }

    // Status filters
    if (is_active !== undefined) {
      if (is_active) {
        query.andWhere('session.end IS NULL');
      } else {
        query.andWhere('session.end IS NOT NULL');
      }
    }

    if (has_report !== undefined) {
      if (has_report) {
        query.andWhere('reports.report_id IS NOT NULL');
      } else {
        query.andWhere('reports.report_id IS NULL');
      }
    }

    // Date filters
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.andWhere('session.start BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay });
    }

    if (start_date && end_date) {
      query.andWhere('session.start BETWEEN :start_date AND :end_date', { start_date, end_date });
    } else {
      if (start_date) {
        query.andWhere('session.start >= :start_date', { start_date });
      }
      if (end_date) {
        query.andWhere('session.start <= :end_date', { end_date });
      }
    }

    // Time range filters
    if (started_after) {
      query.andWhere('session.start > :started_after', { started_after });
    }

    if (started_before) {
      query.andWhere('session.start < :started_before', { started_before });
    }

    if (ended_after) {
      query.andWhere('session.end > :ended_after', { ended_after });
    }

    if (ended_before) {
      query.andWhere('session.end < :ended_before', { ended_before });
    }

    // Get total count
    const total = await query.getCount();

    // Apply sorting and pagination
    const validSortFields = ['start', 'end', 'session_id', 'device_route.device.device_name', 'device_route.route.route_name'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'start';
    
    query
      .orderBy(`session.${sortField}`, sort_order)
      .skip(skip)
      .take(limit);

    const data = await query.getMany();

    return { data, total };
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