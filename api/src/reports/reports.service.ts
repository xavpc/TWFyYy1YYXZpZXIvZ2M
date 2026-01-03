import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Like, FindOptionsWhere, Not, IsNull } from 'typeorm';
import { Reports } from './reports.entity';
import { DeviceSession } from '../device-session/device-session.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { FilterReportDto } from './dto/filter-report.dto';
import * as ExcelJS from 'exceljs';
import { format } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Reports)
    private reportRepository: Repository<Reports>,
    @InjectRepository(DeviceSession)
    private sessionRepository: Repository<DeviceSession>,
  ) {}

  async exportToExcel(filterDto: FilterReportDto): Promise<Buffer> {
    // 1. Fetch ALL matching reports, ignoring pagination for the export.
    const { data: reports } = await this.findAll({ 
      ...filterDto, 
      // Override pagination to get all records for the export
      page: 1, 
      limit: 0, // A value of 0 will signal to our modified findAll to fetch all
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Your App Name';
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet('Reports');

    // 2. Define the columns for the Excel sheet.
    // The 'key' must match the property name in the 'reports' objects.
    worksheet.columns = [
      { header: 'Report ID', key: 'report_id', width: 38 },
      { header: 'Route Name', key: 'route_name', width: 30 },
      { header: 'Vehicle Plate Number', key: 'vehicle_plate_number', width: 25 },
      { header: 'Employee Name', key: 'employee_name', width: 30 },
      { header: 'Report Timestamp', key: 'report_timestamp_formatted', width: 25 },
      { header: 'Session Start Time', key: 'session_start_time_formatted', width: 25 },
      { header: 'Session End Time', key: 'session_end_time_formatted', width: 25 },
      { header: 'Remarks', key: 'remarks', width: 50 },
    ];
    
    // 3. Style the header row.
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF003366' }, // A dark blue background
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // 4. Format the data and add it to the worksheet.
    const dataToExport = reports.map(report => ({
      ...report,
      // Format dates for consistent, readable output in Excel
      report_timestamp_formatted: format(new Date(report.report_timestamp), 'yyyy-MM-dd HH:mm:ss'),
      session_start_time_formatted: format(new Date(report.session_start_time), 'yyyy-MM-dd HH:mm:ss'),
      session_end_time_formatted: format(new Date(report.session_end_time), 'yyyy-MM-dd HH:mm:ss'),
    }));

    worksheet.addRows(dataToExport);

    // Make the remarks column wrap text
    worksheet.getColumn('remarks').alignment = { wrapText: true, vertical: 'top' };

    // 5. Generate the .xlsx file buffer and return it.
    return await workbook.xlsx.writeBuffer() as Buffer;
  }


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
      remarks_search,
      search, 
      page = 1, 
      limit = 10,
      sort_by = 'report_timestamp',
      sort_order = 'DESC'
    } = filterDto;

    const skip = (page - 1) * limit;
    let where: FindOptionsWhere<Reports> | FindOptionsWhere<Reports>[] = {};

    // Handle global search
    if (search) {
      // Create base search conditions across all searchable fields
      const searchConditions: FindOptionsWhere<Reports>[] = [
        { route_name: Like(`%${search}%`) },
        { vehicle_plate_number: Like(`%${search}%`) },
        { employee_name: Like(`%${search}%`) },
        { remarks: Like(`%${search}%`) }
      ];

      // Apply additional individual filters to each search condition
      const additionalFilters: Partial<FindOptionsWhere<Reports>> = {};
      
      if (route_name) additionalFilters.route_name = Like(`%${route_name}%`);
      if (vehicle_plate_number) additionalFilters.vehicle_plate_number = Like(`%${vehicle_plate_number}%`);
      if (employee_name) additionalFilters.employee_name = Like(`%${employee_name}%`);
      if (remarks_search) additionalFilters.remarks = Like(`%${remarks_search}%`);

      // Handle date range filters
      if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);
        additionalFilters.report_timestamp = Between(startDate, endDate);
      } else if (start_date) {
        additionalFilters.report_timestamp = MoreThanOrEqual(new Date(start_date));
      } else if (end_date) {
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);
        additionalFilters.report_timestamp = LessThanOrEqual(endDate);
      }

      // Combine search conditions with additional filters
      where = searchConditions.map(condition => ({
        ...condition,
        ...additionalFilters
      }));
    } else {
      // Handle individual field filters when no global search
      const whereCondition: FindOptionsWhere<Reports> = {};

      if (route_name) {
        whereCondition.route_name = Like(`%${route_name}%`);
      }
      
      if (vehicle_plate_number) {
        whereCondition.vehicle_plate_number = Like(`%${vehicle_plate_number}%`);
      }
      
      if (employee_name) {
        whereCondition.employee_name = Like(`%${employee_name}%`);
      }
      
      if (remarks_search) {
        whereCondition.remarks = Like(`%${remarks_search}%`);
      }

      // Date range filters
      if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);
        
        whereCondition.report_timestamp = Between(startDate, endDate);
      } else if (start_date) {
        whereCondition.report_timestamp = MoreThanOrEqual(new Date(start_date));
      } else if (end_date) {
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);
        whereCondition.report_timestamp = LessThanOrEqual(endDate);
      }

      where = whereCondition;
    }

    const total = await this.reportRepository.count();

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

}