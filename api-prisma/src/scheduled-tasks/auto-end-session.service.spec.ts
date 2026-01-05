import { Test, TestingModule } from '@nestjs/testing';
import { AutoSessionEndService } from './auto-end-session.service';
import { DeviceSessionService } from '../device-session/device-session.service';
import { AutoReportGenerationService } from './auto-report-generation.service';
import { testDeviceSessions } from '../test/fixtures';

describe('AutoSessionEndService', () => {
  let service: AutoSessionEndService;
  let deviceSessionService: jest.Mocked<DeviceSessionService>;
  let autoReportGenerationService: jest.Mocked<AutoReportGenerationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoSessionEndService,
        {
          provide: DeviceSessionService,
          useValue: {
            findActiveSessions: jest.fn(),
            endSession: jest.fn(),
          },
        },
        {
          provide: AutoReportGenerationService,
          useValue: {
            manuallyGenerateReports: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AutoSessionEndService>(AutoSessionEndService);
    deviceSessionService = module.get(DeviceSessionService);
    autoReportGenerationService = module.get(AutoReportGenerationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCronEndSessions', () => {
    it('should identify and end active sessions', async () => {
      const activeSessions = [testDeviceSessions.activeSession];
      deviceSessionService.findActiveSessions.mockResolvedValue(activeSessions);
      deviceSessionService.endSession.mockResolvedValue({
        ...testDeviceSessions.activeSession,
        end: new Date(),
      });
      autoReportGenerationService.manuallyGenerateReports.mockResolvedValue({
        message: 'Reports generation triggered manually',
      });

      await service.handleCronEndSessions();

      expect(deviceSessionService.findActiveSessions).toHaveBeenCalled();
      expect(deviceSessionService.endSession).toHaveBeenCalledWith(
        testDeviceSessions.activeSession.session_id,
      );
    });

    it('should not end sessions when no active sessions exist', async () => {
      deviceSessionService.findActiveSessions.mockResolvedValue([]);
      autoReportGenerationService.manuallyGenerateReports.mockResolvedValue({
        message: 'Reports generation triggered manually',
      });

      await service.handleCronEndSessions();

      expect(deviceSessionService.findActiveSessions).toHaveBeenCalled();
      expect(deviceSessionService.endSession).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      deviceSessionService.findActiveSessions.mockRejectedValue(new Error('DB Error'));

      // Should not throw
      await expect(service.handleCronEndSessions()).resolves.not.toThrow();
    });
  });

  describe('runReportGenerationWithRetries', () => {
    it('should generate reports successfully', async () => {
      autoReportGenerationService.manuallyGenerateReports.mockResolvedValue({
        message: 'Reports generation triggered manually',
      });

      await service.runReportGenerationWithRetries(3);

      expect(autoReportGenerationService.manuallyGenerateReports).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      autoReportGenerationService.manuallyGenerateReports
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({ message: 'Success' });

      await service.runReportGenerationWithRetries(3);

      expect(autoReportGenerationService.manuallyGenerateReports).toHaveBeenCalledTimes(2);
    }, 15000);

    it('should stop after max retries', async () => {
      autoReportGenerationService.manuallyGenerateReports.mockRejectedValue(
        new Error('Always fails'),
      );

      await service.runReportGenerationWithRetries(2);

      expect(autoReportGenerationService.manuallyGenerateReports).toHaveBeenCalledTimes(2);
    }, 20000);
  });
});
