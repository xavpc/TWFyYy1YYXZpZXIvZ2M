import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, UseGuards, Res, StreamableFile, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Reports } from '@prisma/client';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { FilterReportDto } from './dto/filter-report.dto';
import { AutoSessionEndService } from 'src/scheduled-tasks/auto-end-session.service';
import { Response } from 'express';
import { ReportPdfService } from './report-pdf.service';

@ApiTags('reports')
@Controller('reports')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(
    private readonly reportService: ReportsService,
    private readonly autoSessionEndService: AutoSessionEndService,
    private readonly reportPdfService : ReportPdfService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all reports with filtering, pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'Reports retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Reports retrieved successfully' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Reports' }
        },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 15 }
      }
    }
  })
  async findAll(@Query() filterDto: FilterReportDto) {
    const result = await this.reportService.findAll(filterDto);
    
    const totalPages = filterDto?.limit ? Math.ceil(result.total / filterDto.limit) : 1;
    
    return {
      success: true,
      message: 'Reports retrieved successfully',
      data: result.data,
      total: result.total,
      page: filterDto?.page || 1,
      limit: filterDto?.limit || result.data.length,
      totalPages,
    };
  }

  @Post('generate-pdf')
  async generatePdf(
    @Body() reportData: any,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.reportPdfService.generatePdf(reportData);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=garbage-collection-report.pdf',
        'Content-Length': pdfBuffer.length,
      });
      
      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new HttpException(
        'Failed to generate PDF report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }



  // @Get('export/excel')
  // @ApiOperation({ summary: 'Export reports to an Excel file based on filters' })
  // @ApiResponse({ 
  //     status: HttpStatus.OK, 
  //     description: 'An Excel file containing the filtered reports.',
  // })
  // // This endpoint reuses the same FilterReportDto as your main `findAll` endpoint.
  // async exportToExcel(
  //   @Query() filterDto: FilterReportDto,
  //   @Res() res: Response // Inject the response object
  // ) {
  //   // 1. Call the service to get the Excel file buffer
  //   const buffer = await this.reportService.exportToExcel(filterDto);

  //   // 2. Create a dynamic filename with the current date
  //   const date = new Date().toISOString().split('T')[0]; // e.g., "2023-10-27"
  //   const filename = `reports-${date}.xlsx`;

  //   // 3. Set the HTTP headers to trigger a file download in the browser
  //   res.setHeader(
  //       'Content-Type', 
  //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //   );
  //   res.setHeader(
  //       'Content-Disposition', 
  //       `attachment; filename=${filename}`
  //   );

  //   // 4. Send the buffer as the response
  //   res.send(buffer);
  // }

  @Post('generate')
  @ApiOperation({ summary: 'Manually trigger auto report generation with retries' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Report generation process started successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Failed to start report generation process' 
  })
  async triggerReportGeneration() {
    await this.autoSessionEndService.runReportGenerationWithRetries();
    return { 
      status: HttpStatus.OK,
      message: 'Report generation process started successfully'
    };
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