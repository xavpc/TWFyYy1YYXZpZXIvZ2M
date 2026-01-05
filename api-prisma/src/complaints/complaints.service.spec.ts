import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testComplaints, testImages, testDevices, createDTOs } from '../test/fixtures';

describe('ComplaintsService', () => {
  let service: ComplaintsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ComplaintsService>(ComplaintsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create complaint', async () => {
      prisma.complaints.findUnique.mockResolvedValue(null);
      prisma.image.findUnique.mockResolvedValue(testImages.image1);
      prisma.device.findUnique.mockResolvedValue(testDevices.device1);
      prisma.complaints.create.mockResolvedValue(testComplaints.complaint1);

      const result = await service.create(createDTOs.createComplaint);

      expect(prisma.complaints.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should reject duplicate title', async () => {
      prisma.complaints.findUnique.mockResolvedValue(testComplaints.complaint1);

      await expect(
        service.create({
          ...createDTOs.createComplaint,
          title: testComplaints.complaint1.title,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when image not found', async () => {
      prisma.complaints.findUnique.mockResolvedValue(null);
      prisma.image.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          ...createDTOs.createComplaint,
          image_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when device not found', async () => {
      prisma.complaints.findUnique.mockResolvedValue(null);
      prisma.image.findUnique.mockResolvedValue(testImages.image1);
      prisma.device.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          ...createDTOs.createComplaint,
          device_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all complaints', async () => {
      const complaints = [testComplaints.complaint1, testComplaints.complaint2];
      prisma.complaints.findMany.mockResolvedValue(complaints);

      const result = await service.findAll();

      expect(result).toEqual(complaints);
    });
  });

  describe('findOne', () => {
    it('should return complaint by ID', async () => {
      prisma.complaints.findUnique.mockResolvedValue(testComplaints.complaint1);

      const result = await service.findOne(testComplaints.complaint1.complaint_id);

      expect(result).toEqual(testComplaints.complaint1);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.complaints.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update complaint', async () => {
      prisma.complaints.findUnique.mockResolvedValue(testComplaints.complaint1);
      prisma.complaints.update.mockResolvedValue({
        ...testComplaints.complaint1,
        description: 'Updated description',
      });

      const result = await service.update(testComplaints.complaint1.complaint_id, {
        description: 'Updated description',
      });

      expect(result.description).toBe('Updated description');
    });

    it('should throw NotFoundException when image not found on update', async () => {
      prisma.complaints.findUnique.mockResolvedValue(testComplaints.complaint1);
      prisma.image.findUnique.mockResolvedValue(null);

      await expect(
        service.update(testComplaints.complaint1.complaint_id, {
          image_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when device not found on update', async () => {
      prisma.complaints.findUnique.mockResolvedValue(testComplaints.complaint1);
      prisma.device.findUnique.mockResolvedValue(null);

      await expect(
        service.update(testComplaints.complaint1.complaint_id, {
          device_id: 'nonexistent',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete complaint', async () => {
      prisma.complaints.findUnique.mockResolvedValue(testComplaints.complaint1);
      prisma.complaints.delete.mockResolvedValue(testComplaints.complaint1);

      await service.remove(testComplaints.complaint1.complaint_id);

      expect(prisma.complaints.delete).toHaveBeenCalledWith({
        where: { complaint_id: testComplaints.complaint1.complaint_id },
      });
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.complaints.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
