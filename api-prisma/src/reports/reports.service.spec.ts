import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testReports, testDeviceSessions, testDeviceRoutes, testRoutes, testDevices, testEmployees } from '../test/fixtures';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create report from session', async () => {
      const sessionWithRelations = {
        ...testDeviceSessions.completedSession,
        device_route: {
          ...testDeviceRoutes.deviceRoute1,
          route: testRoutes.routeA,
          device: {
            ...testDevices.device1,
            employee: testEmployees.employee1,
          },
        },
      };
      prisma.deviceSession.findFirst.mockResolvedValue(sessionWithRelations);
      prisma.reports.create.mockResolvedValue(testReports.report1);

      const result = await service.create({
        session_id: testDeviceSessions.completedSession.session_id,
        remarks: 'Test remarks',
      });

      expect(prisma.reports.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when session not found', async () => {
      prisma.deviceSession.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ session_id: 'nonexistent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when session not completed', async () => {
      prisma.deviceSession.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ session_id: testDeviceSessions.activeSession.session_id }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all reports', async () => {
      const reports = [testReports.report1, testReports.report2];
      prisma.reports.findMany.mockResolvedValue(reports);
      prisma.reports.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result.data).toEqual(reports);
      expect(result.total).toBe(2);
    });

    it('should apply pagination', async () => {
      prisma.reports.findMany.mockResolvedValue([testReports.report1]);
      prisma.reports.count.mockResolvedValue(10);

      await service.findAll({ page: 2, limit: 5 });

      expect(prisma.reports.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });

    it('should apply global search', async () => {
      prisma.reports.findMany.mockResolvedValue([]);
      prisma.reports.count.mockResolvedValue(0);

      await service.findAll({ search: 'Downtown' });

      expect(prisma.reports.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { route_name: { contains: 'Downtown' } },
            ]),
          }),
        }),
      );
    });

    it('should filter by date range', async () => {
      prisma.reports.findMany.mockResolvedValue([testReports.report1]);
      prisma.reports.count.mockResolvedValue(1);

      await service.findAll({
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      });

      expect(prisma.reports.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            report_timestamp: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return report by ID', async () => {
      prisma.reports.findUnique.mockResolvedValue(testReports.report1);

      const result = await service.findOne(testReports.report1.report_id);

      expect(result).toEqual(testReports.report1);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.reports.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update remarks', async () => {
      prisma.reports.findUnique.mockResolvedValue(testReports.report1);
      prisma.reports.update.mockResolvedValue({
        ...testReports.report1,
        remarks: 'Updated remarks',
      });

      const result = await service.update(testReports.report1.report_id, {
        remarks: 'Updated remarks',
      });

      expect(result.remarks).toBe('Updated remarks');
    });
  });

  describe('remove', () => {
    it('should delete report', async () => {
      prisma.reports.findUnique.mockResolvedValue(testReports.report1);
      prisma.reports.delete.mockResolvedValue(testReports.report1);

      await service.remove(testReports.report1.report_id);

      expect(prisma.reports.delete).toHaveBeenCalledWith({
        where: { report_id: testReports.report1.report_id },
      });
    });
  });

  describe('getReportsByDateRange', () => {
    it('should filter by date range', async () => {
      prisma.reports.findMany.mockResolvedValue([testReports.report1]);

      const result = await service.getReportsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(result).toHaveLength(1);
      expect(prisma.reports.findMany).toHaveBeenCalledWith({
        where: {
          report_timestamp: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        orderBy: { report_timestamp: 'desc' },
      });
    });
  });

  describe('getReportsByRoute', () => {
    it('should filter by route name', async () => {
      prisma.reports.findMany.mockResolvedValue([testReports.report1]);

      const result = await service.getReportsByRoute('Downtown');

      expect(result).toHaveLength(1);
      expect(prisma.reports.findMany).toHaveBeenCalledWith({
        where: { route_name: { contains: 'Downtown' } },
        orderBy: { report_timestamp: 'desc' },
      });
    });
  });

  describe('getReportsByEmployee', () => {
    it('should filter by employee name', async () => {
      prisma.reports.findMany.mockResolvedValue([testReports.report1]);

      const result = await service.getReportsByEmployee('Taro');

      expect(result).toHaveLength(1);
      expect(prisma.reports.findMany).toHaveBeenCalledWith({
        where: { employee_name: { contains: 'Taro' } },
        orderBy: { report_timestamp: 'desc' },
      });
    });
  });

  describe('getReportsByVehicle', () => {
    it('should filter by plate number', async () => {
      prisma.reports.findMany.mockResolvedValue([testReports.report1]);

      const result = await service.getReportsByVehicle('ABC');

      expect(result).toHaveLength(1);
      expect(prisma.reports.findMany).toHaveBeenCalledWith({
        where: { vehicle_plate_number: { contains: 'ABC' } },
        orderBy: { report_timestamp: 'desc' },
      });
    });
  });

  describe('exportToExcel', () => {
    it('should generate Excel file', async () => {
      const reports = [testReports.report1, testReports.report2];
      prisma.reports.findMany.mockResolvedValue(reports);
      prisma.reports.count.mockResolvedValue(2);

      const result = await service.exportToExcel({});

      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
