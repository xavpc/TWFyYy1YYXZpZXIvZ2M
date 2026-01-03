import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Like, FindOptionsWhere, Not, IsNull } from 'typeorm';
import { Reports } from './reports.entity';
import { DeviceSession } from '../device-session/device-session.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { FilterReportDto } from './dto/filter-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Reports)
    private reportRepository: Repository<Reports>,
    @InjectRepository(DeviceSession)
    private sessionRepository: Repository<DeviceSession>,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Reports> {
    const { session_id, remarks } = createReportDto;
    
    const session = await this.sessionRepository.findOne({
      where: { 
        session_id,
        end: Not(IsNull()),
      },
      relations: [
        'device_route', 
        'device_route.route', 
        'device_route.device', 
        'device_route.device.employee'
      ],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${session_id} not found or not completed`);
    }

    const route_name = session.device_route.route.route_name; 
    const vehicle_plate_number = session.device_route.device.vehicle_plate_num; 
    
    const employee = session.device_route.device.employee;
    const employee_name = employee.middle_name 
      ? `${employee.first_name} ${employee.middle_name} ${employee.last_name}`
      : `${employee.first_name} ${employee.last_name}`;

    const newReport = this.reportRepository.create({
      session,
      route_name,
      vehicle_plate_number,
      employee_name,
      report_timestamp: new Date(), 
      remarks,
      session_start_time: session.start,
      session_end_time: session.end,
    });

    return this.reportRepository.save(newReport);
  }

  async findAll(filterDto: FilterReportDto): Promise<{ data: Reports[], total: number }> {
    const { 
      route_name, 
      vehicle_plate_number, 
      employee_name, 
      start_date, 
      end_date, 
      // start_time, 
      // end_time,
      remarks_search,
      page = 1, 
      limit = 10,
      sort_by = 'report_timestamp',
      sort_order = 'DESC'
    } = filterDto;

    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Reports> = {};

    
    if (route_name) {
      where.route_name = Like(`%${route_name}%`);
    }
    
    if (vehicle_plate_number) {
      where.vehicle_plate_number = Like(`%${vehicle_plate_number}%`);
    }
    
    if (employee_name) {
      where.employee_name = Like(`%${employee_name}%`);
    }
    
    if (remarks_search) {
      where.remarks = Like(`%${remarks_search}%`);
    }

    // Date range filters
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      where.report_timestamp = Between(startDate, endDate);
    } else if (start_date) {
      where.report_timestamp = MoreThanOrEqual(new Date(start_date));
    } else if (end_date) {
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999); // End of day
      where.report_timestamp = LessThanOrEqual(endDate);
    }

    // if (start_time && end_time) {
    //   const [startHour, startMinute] = start_time.split(':').map(Number);
    //   const [endHour, endMinute] = end_time.split(':').map(Number);
      
    // }

    const total = await this.reportRepository.count({ where });

    // Get paginated data with sorting
    const data = await this.reportRepository.find({
      where,
      skip,
      take: limit,
      order: {
        [sort_by]: sort_order,
      },
      relations: ['session'],
    });

    return { data, total };
  }

  async findOne(report_id: string): Promise<Reports> {
    const report = await this.reportRepository.findOne({
      where: { report_id },
      relations: ['session'],
    });

    if (!report) {
      throw new NotFoundException(`Reports with ID ${report_id} not found`);
    }

    return report;
  }

  async update(report_id: string, updateReportDto: UpdateReportDto): Promise<Reports> {
    const report = await this.findOne(report_id);
    
    if (updateReportDto.remarks !== undefined) {
      report.remarks = updateReportDto.remarks;
    }

    return this.reportRepository.save(report);
  }

  async remove(report_id: string): Promise<void> {
    const report = await this.findOne(report_id);
    await this.reportRepository.remove(report);
  }

  async getReportsByDateRange(startDate: Date, endDate: Date): Promise<Reports[]> {
    return this.reportRepository.find({
      where: {
        report_timestamp: Between(startDate, endDate),
      },
      order: {
        report_timestamp: 'DESC',
      },
    });
  }

  async getReportsByRoute(routeName: string): Promise<Reports[]> {
    return this.reportRepository.find({
      where: {
        route_name: Like(`%${routeName}%`),
      },
      order: {
        report_timestamp: 'DESC',
      },
    });
  }

  async getReportsByEmployee(employeeName: string): Promise<Reports[]> {
    return this.reportRepository.find({
      where: {
        employee_name: Like(`%${employeeName}%`),
      },
      order: {
        report_timestamp: 'DESC',
      },
    });
  }

  async getReportsByVehicle(plateNumber: string): Promise<Reports[]> {
    return this.reportRepository.find({
      where: {
        vehicle_plate_number: Like(`%${plateNumber}%`),
      },
      order: {
        report_timestamp: 'DESC',
      },
    });
  }

  // async getReportStatistics(): Promise<{
  //   totalReports: number;
  //   reportsByRoute: { route: string; count: number }[];
  //   reportsByEmployee: { employee: string; count: number }[];
  //   reportsByVehicle: { vehicle: string; count: number }[];
  //   averageSessionDuration: number;
  // }> {
  //   const totalReports = await this.reportRepository.count();
    
  //   const reportsByRouteQuery = await this.reportRepository
  //     .createQueryBuilder('report')
  //     .select('report.route_name', 'route')
  //     .addSelect('COUNT(report.report_id)', 'count')
  //     .groupBy('report.route_name')
  //     .orderBy('count', 'DESC')
  //     .getRawMany();
    
  //   const reportsByEmployeeQuery = await this.reportRepository
  //     .createQueryBuilder('report')
  //     .select('report.employee_name', 'employee')
  //     .addSelect('COUNT(report.report_id)', 'count')
  //     .groupBy('report.employee_name')
  //     .orderBy('count', 'DESC')
  //     .getRawMany();
    
  //   const reportsByVehicleQuery = await this.reportRepository
  //     .createQueryBuilder('report')
  //     .select('report.vehicle_plate_number', 'vehicle')
  //     .addSelect('COUNT(report.report_id)', 'count')
  //     .groupBy('report.vehicle_plate_number')
  //     .orderBy('count', 'DESC')
  //     .getRawMany();
    
  //   const avgDurationQuery = await this.reportRepository
  //     .createQueryBuilder('report')
  //     .select('AVG(EXTRACT(EPOCH FROM (report.session_end_time - report.session_start_time)))', 'avg_duration')
  //     .getRawOne();
    
  //   const averageSessionDuration = parseFloat(avgDurationQuery.avg_duration) || 0;
    
  //   return {
  //     totalReports,
  //     reportsByRoute: reportsByRouteQuery,
  //     reportsByEmployee: reportsByEmployeeQuery,
  //     reportsByVehicle: reportsByVehicleQuery,
  //     averageSessionDuration, // in seconds
  //   };
  // }
}