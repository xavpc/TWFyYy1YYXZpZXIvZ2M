import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AutoReportGenerationService } from './auto-report-generation.service';
import { DeviceSessionService } from '../device-session/device-session.service';
import { ReportsService } from '../reports/reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testDeviceSessions, testReports, testDeviceRoutes, testRoutes, testDevices, testEmployees } from '../test/fixtures';

describe('AutoReportGenerationService', () => {
  let service: AutoReportGenerationService;
  let deviceSessionService: jest.Mocked<DeviceSessionService>;
  let reportsService: jest.Mocked<ReportsService>;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoReportGenerationService,
        {
          provide: DeviceSessionService,
          useValue: {
            findRecentlyEndedSessions: jest.fn(),
          },
        },
        {
          provide: ReportsService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addInterval: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AutoReportGenerationService>(AutoReportGenerationService);
    deviceSessionService = module.get(DeviceSessionService);
    reportsService = module.get(ReportsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAutoReportGeneration', () => {
    it('should find recently ended sessions', async () => {
      const completedSession = {
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
      deviceSessionService.findRecentlyEndedSessions.mockResolvedValue([completedSession]);
      prisma.reports.findMany.mockResolvedValue([]);
      prisma.reports.findFirst.mockResolvedValue(null);
      reportsService.create.mockResolvedValue(testReports.report1);

      await service.handleAutoReportGeneration();

      expect(deviceSessionService.findRecentlyEndedSessions).toHaveBeenCalled();
    });

    it('should generate reports for ended sessions without reports', async () => {
      const completedSession = {
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
      deviceSessionService.findRecentlyEndedSessions.mockResolvedValue([completedSession]);
      prisma.reports.findMany.mockResolvedValue([]);
      prisma.reports.findFirst.mockResolvedValue(null);
      reportsService.create.mockResolvedValue(testReports.report1);

      await service.handleAutoReportGeneration();

      expect(reportsService.create).toHaveBeenCalled();
    });

    it('should skip sessions with existing reports', async () => {
      const completedSession = {
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
      deviceSessionService.findRecentlyEndedSessions.mockResolvedValue([completedSession]);
      prisma.reports.findMany.mockResolvedValue([{
        ...testReports.report1,
        session: completedSession,
      }]);

      await service.handleAutoReportGeneration();

      expect(reportsService.create).not.toHaveBeenCalled();
    });

    it('should handle no ended sessions', async () => {
      deviceSessionService.findRecentlyEndedSessions.mockResolvedValue([]);

      await service.handleAutoReportGeneration();

      expect(reportsService.create).not.toHaveBeenCalled();
    });

    it('should handle empty sessions array', async () => {
      deviceSessionService.findRecentlyEndedSessions.mockResolvedValue(null as any);

      await service.handleAutoReportGeneration();

      expect(reportsService.create).not.toHaveBeenCalled();
    });
  });

  describe('manuallyGenerateReports', () => {
    it('should trigger report generation', async () => {
      deviceSessionService.findRecentlyEndedSessions.mockResolvedValue([]);

      const result = await service.manuallyGenerateReports();

      expect(result).toEqual({ message: 'Reports generation triggered manually' });
      expect(deviceSessionService.findRecentlyEndedSessions).toHaveBeenCalled();
    });
  });
});
