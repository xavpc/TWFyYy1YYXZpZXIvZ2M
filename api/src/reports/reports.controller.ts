import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Reports } from './reports.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { FilterReportDto } from './dto/filter-report.dto';


@ApiTags('reports')
@Controller('reports')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportService: ReportsService) {}



  @Get()
  @ApiOperation({ summary: 'Get all reports with filtering options' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all reports that match the filters' })
  findAll(@Query() filterDto: FilterReportDto): Promise<{ data: Reports[], total: number }> {
    return this.reportService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report by ID' })
  @ApiParam({ name: 'id', description: 'Reports ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns the report', type: Reports })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Reports not found' })
  findOne(@Param('id') id: string): Promise<Reports> {
    return this.reportService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a report' })
  @ApiParam({ name: 'id', description: 'Reports ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reports successfully updated', type: Reports })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Reports not found' })
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto): Promise<Reports> {
    return this.reportService.update(id, updateReportDto);
  }

//   @Delete(':id')
//   @ApiOperation({ summary: 'Delete a report' })
//   @ApiParam({ name: 'id', description: 'Reports ID' })
//   @ApiResponse({ status: HttpStatus.OK, description: 'Reports successfully deleted' })
//   @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Reports not found' })
//   remove(@Param('id') id: string): Promise<void> {
//     return this.reportService.remove(id);
//   }

//   @Get('statistics/summary')
//   @ApiOperation({ summary: 'Get summary statistics of all reports' })
//   @ApiResponse({ status: HttpStatus.OK, description: 'Returns report statistics' })
//   getStatistics() {
//     return this.reportService.getReportStatistics();
//   }

  @Get('filter/by-date-range')
  @ApiOperation({ summary: 'Get reports by date range' })
  @ApiQuery({ name: 'startDate', required: true, type: Date })
  @ApiQuery({ name: 'endDate', required: true, type: Date })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns reports within date range' })
  getByDateRange(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<Reports[]> {
    return this.reportService.getReportsByDateRange(startDate, endDate);
  }

  @Get('filter/by-route')
  @ApiOperation({ summary: 'Get reports by route name' })
  @ApiQuery({ name: 'routeName', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns reports for specified route' })
  getByRoute(@Query('routeName') routeName: string): Promise<Reports[]> {
    return this.reportService.getReportsByRoute(routeName);
  }

  @Get('filter/by-employee')
  @ApiOperation({ summary: 'Get reports by employee name' })
  @ApiQuery({ name: 'employeeName', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns reports for specified employee' })
  getByEmployee(@Query('employeeName') employeeName: string): Promise<Reports[]> {
    return this.reportService.getReportsByEmployee(employeeName);
  }

  @Get('filter/by-vehicle')
  @ApiOperation({ summary: 'Get reports by vehicle plate number' })
  @ApiQuery({ name: 'plateNumber', required: true })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns reports for specified vehicle' })
  getByVehicle(@Query('plateNumber') plateNumber: string): Promise<Reports[]> {
    return this.reportService.getReportsByVehicle(plateNumber);
  }
}