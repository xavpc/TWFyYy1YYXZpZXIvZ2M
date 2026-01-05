import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ImageService } from './image.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrismaService, resetPrismaMocks } from '../test/mocks/prisma.mock';
import { testImages, testRoutes } from '../test/fixtures';

describe('ImageService', () => {
  let service: ImageService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all images', async () => {
      const images = [testImages.image1, testImages.image2];
      prisma.image.findMany.mockResolvedValue(images);

      const result = await service.findAll();

      expect(result).toEqual(images);
      expect(prisma.image.findMany).toHaveBeenCalledWith({
        include: { route: true },
      });
    });

    it('should return empty array when no images exist', async () => {
      prisma.image.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return image by ID', async () => {
      prisma.image.findUnique.mockResolvedValue(testImages.image1);

      const result = await service.findOne(testImages.image1.image_id);

      expect(result).toEqual(testImages.image1);
      expect(prisma.image.findUnique).toHaveBeenCalledWith({
        where: { image_id: testImages.image1.image_id },
        include: { route: true },
      });
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.image.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByRouteId', () => {
    it('should return images for route', async () => {
      const images = [testImages.image1];
      prisma.image.findMany.mockResolvedValue(images);

      const result = await service.findByRouteId(testRoutes.routeA.route_id);

      expect(result).toHaveLength(1);
      expect(prisma.image.findMany).toHaveBeenCalledWith({
        where: { route_id: testRoutes.routeA.route_id },
        include: { route: true },
      });
    });

    it('should return empty array when no images for route', async () => {
      prisma.image.findMany.mockResolvedValue([]);

      const result = await service.findByRouteId('no-images-route');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update image status', async () => {
      prisma.image.findUnique.mockResolvedValue(testImages.image1);
      prisma.image.update.mockResolvedValue({
        ...testImages.image1,
        status: 'inactive',
      });

      const result = await service.update(testImages.image1.image_id, {
        status: 'inactive',
      });

      expect(result.status).toBe('inactive');
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.image.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { status: 'inactive' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
