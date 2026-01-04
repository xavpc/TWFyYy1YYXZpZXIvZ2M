import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Reports, Prisma } from '@prisma/client';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { FilterReportDto } from './dto/filter-report.dto';
import * as ExcelJS from 'exceljs';
import { format } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

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

    const session = await this.prisma.deviceSession.findFirst({
      where: {
        session_id,
        end: { not: null },
      },
      include: {
        device_route: {
          include: {
            route: true,
            device: {
              include: { employee: true }
            }
          }
        }
      }
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

    return this.prisma.reports.create({
      data: {
        session_id,
        route_name,
        vehicle_plate_number,
        employee_name,
        report_timestamp: new Date(),
        remarks,
        session_start_time: session.start,
        session_end_time: session.end!,
      }
    });
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
    const where: Prisma.ReportsWhereInput = {};

    // Handle global search
    if (search) {
      where.OR = [
        { route_name: { contains: search } },
        { vehicle_plate_number: { contains: search } },
        { employee_name: { contains: search } },
        { remarks: { contains: search } }
      ];

      // Apply additional individual filters
      if (route_name) {
        where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { route_name: { contains: route_name } }];
      }
      if (vehicle_plate_number) {
        where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { vehicle_plate_number: { contains: vehicle_plate_number } }];
      }
      if (employee_name) {
        where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { employee_name: { contains: employee_name } }];
      }
      if (remarks_search) {
        where.AND = [...(Array.isArray(where.AND) ? where.AND : []), { remarks: { contains: remarks_search } }];
      }
    } else {
      // Handle individual field filters when no global search
      if (route_name) {
        where.route_name = { contains: route_name };
      }

      if (vehicle_plate_number) {
        where.vehicle_plate_number = { contains: vehicle_plate_number };
      }

      if (employee_name) {
        where.employee_name = { contains: employee_name };
      }

      if (remarks_search) {
        where.remarks = { contains: remarks_search };
      }
    }

    // Date range filters
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999);
      where.report_timestamp = { gte: startDate, lte: endDate };
    } else if (start_date) {
      where.report_timestamp = { gte: new Date(start_date) };
    } else if (end_date) {
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999);
      where.report_timestamp = { lte: endDate };
    }

    const total = await this.prisma.reports.count({ where });

    // Get paginated data with sorting
    const findManyOptions: Prisma.ReportsFindManyArgs = {
      where,
      orderBy: { [sort_by]: sort_order.toLowerCase() as 'asc' | 'desc' },
      include: { session: true },
    };

    // Only apply pagination if limit > 0
    if (limit > 0) {
      findManyOptions.skip = skip;
      findManyOptions.take = limit;
    }

    const data = await this.prisma.reports.findMany(findManyOptions);

    return { data, total };
  }

  async findOne(report_id: string): Promise<Reports & { session: any }> {
    const report = await this.prisma.reports.findUnique({
      where: { report_id },
      include: { session: true },
    });

    if (!report) {
      throw new NotFoundException(`Reports with ID ${report_id} not found`);
    }

    return report;
  }

  async update(report_id: string, updateReportDto: UpdateReportDto): Promise<Reports> {
    await this.findOne(report_id);

    return this.prisma.reports.update({
      where: { report_id },
      data: {
        remarks: updateReportDto.remarks
      }
    });
  }

  async remove(report_id: string): Promise<void> {
    await this.findOne(report_id);

    await this.prisma.reports.delete({
      where: { report_id }
    });
  }

  async getReportsByDateRange(startDate: Date, endDate: Date): Promise<Reports[]> {
    return this.prisma.reports.findMany({
      where: {
        report_timestamp: { gte: startDate, lte: endDate },
      },
      orderBy: { report_timestamp: 'desc' },
    });
  }

  async getReportsByRoute(routeName: string): Promise<Reports[]> {
    return this.prisma.reports.findMany({
      where: {
        route_name: { contains: routeName },
      },
      orderBy: { report_timestamp: 'desc' },
    });
  }

  async getReportsByEmployee(employeeName: string): Promise<Reports[]> {
    return this.prisma.reports.findMany({
      where: {
        employee_name: { contains: employeeName },
      },
      orderBy: { report_timestamp: 'desc' },
    });
  }

  async getReportsByVehicle(plateNumber: string): Promise<Reports[]> {
    return this.prisma.reports.findMany({
      where: {
        vehicle_plate_number: { contains: plateNumber },
      },
      orderBy: { report_timestamp: 'desc' },
    });
  }
}
