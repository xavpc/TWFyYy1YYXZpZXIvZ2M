import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AutoSessionEndService } from '../scheduled-tasks/auto-end-session.service';
import { ReportPdfService } from './report-pdf.service';
import { testReports } from '../test/fixtures';

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: jest.Mocked<ReportsService>;
  let autoSessionEndService: jest.Mocked<AutoSessionEndService>;
  let reportPdfService: jest.Mocked<ReportPdfService>;

  const mockReportsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    getReportsByDateRange: jest.fn(),
    getReportsByRoute: jest.fn(),
    getReportsByEmployee: jest.fn(),
    getReportsByVehicle: jest.fn(),
  };

  const mockAutoSessionEndService = {
    runReportGenerationWithRetries: jest.fn(),
  };

  const mockReportPdfService = {
    generatePdf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
        {
          provide: AutoSessionEndService,
          useValue: mockAutoSessionEndService,
        },
        {
          provide: ReportPdfService,
          useValue: mockReportPdfService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    reportsService = module.get(ReportsService);
    autoSessionEndService = module.get(AutoSessionEndService);
    reportPdfService = module.get(ReportPdfService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all reports with pagination', async () => {
      const reports = [testReports.report1, testReports.report2];
      mockReportsService.findAll.mockResolvedValue({
        data: reports,
        total: 2,
      });

      const result = await controller.findAll({});

      expect(result.success).toBe(true);
      expect(result.message).toBe('Reports retrieved successfully');
      expect(result.total).toBe(2);
    });

    it('should apply pagination parameters', async () => {
      mockReportsService.findAll.mockResolvedValue({
        data: [testReports.report1],
        total: 10,
      });

      const result = await controller.findAll({ page: 1, limit: 5 });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('triggerReportGeneration', () => {
    it('should trigger report generation and return success', async () => {
      mockAutoSessionEndService.runReportGenerationWithRetries.mockResolvedValue(undefined);

      const result = await controller.triggerReportGeneration();

      expect(autoSessionEndService.runReportGenerationWithRetries).toHaveBeenCalled();
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Report generation process started successfully');
    });
  });

  describe('findOne', () => {
    it('should return a report by ID', async () => {
      mockReportsService.findOne.mockResolvedValue(testReports.report1);

      const result = await controller.findOne(testReports.report1.report_id);

      expect(result).toEqual(testReports.report1);
    });
  });

  describe('update', () => {
    it('should update a report', async () => {
      const updateDto = { remarks: 'Updated remarks' };
      mockReportsService.update.mockResolvedValue({
        ...testReports.report1,
        ...updateDto,
      });

      const result = await controller.update(testReports.report1.report_id, updateDto);

      expect(result.remarks).toBe('Updated remarks');
    });
  });

  describe('getByDateRange', () => {
    it('should return reports within date range', async () => {
      mockReportsService.getReportsByDateRange.mockResolvedValue([testReports.report1]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const result = await controller.getByDateRange(startDate, endDate);

      expect(reportsService.getReportsByDateRange).toHaveBeenCalledWith(startDate, endDate);
      expect(result).toEqual([testReports.report1]);
    });
  });

  describe('getByRoute', () => {
    it('should return reports for a specific route', async () => {
      mockReportsService.getReportsByRoute.mockResolvedValue([testReports.report1]);

      const result = await controller.getByRoute('Main Route');

      expect(reportsService.getReportsByRoute).toHaveBeenCalledWith('Main Route');
      expect(result).toEqual([testReports.report1]);
    });
  });

  describe('getByEmployee', () => {
    it('should return reports for a specific employee', async () => {
      mockReportsService.getReportsByEmployee.mockResolvedValue([testReports.report1]);

      const result = await controller.getByEmployee('Taro Yamada');

      expect(reportsService.getReportsByEmployee).toHaveBeenCalledWith('Taro Yamada');
      expect(result).toEqual([testReports.report1]);
    });
  });

  describe('getByVehicle', () => {
    it('should return reports for a specific vehicle', async () => {
      mockReportsService.getReportsByVehicle.mockResolvedValue([testReports.report1]);

      const result = await controller.getByVehicle('ABC-1234');

      expect(reportsService.getReportsByVehicle).toHaveBeenCalledWith('ABC-1234');
      expect(result).toEqual([testReports.report1]);
    });
  });
});
