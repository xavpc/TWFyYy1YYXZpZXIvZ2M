import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { testImages } from '../test/fixtures';

describe('ImageController', () => {
  let controller: ImageController;
  let imageService: jest.Mocked<ImageService>;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  const mockImageService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByRouteId: jest.fn(),
    update: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageController],
      providers: [
        {
          provide: ImageService,
          useValue: mockImageService,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    controller = module.get<ImageController>(ImageController);
    imageService = module.get(ImageService);
    cloudinaryService = module.get(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload an image successfully', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('test'),
        size: 1024,
        path: '/tmp/test.png',
      } as Express.Multer.File;

      const uploadResult = { success: true, url: 'https://cloudinary.com/image.png' };
      mockCloudinaryService.uploadImage.mockResolvedValue(uploadResult);

      const result = await controller.uploadImage(mockFile, 'route-id');

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(mockFile, 'route-id');
      expect(result).toEqual(uploadResult);
    });

    it('should throw BadRequestException when no file uploaded', async () => {
      await expect(controller.uploadImage(null as any, 'route-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all images', async () => {
      const images = [testImages.image1, testImages.image2];
      mockImageService.findAll.mockResolvedValue(images);

      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Images retrieved successfully');
      expect(result.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return an image by ID', async () => {
      mockImageService.findOne.mockResolvedValue(testImages.image1);

      const result = await controller.findOne(testImages.image1.image_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Image retrieved successfully');
      expect(result.data).toEqual(testImages.image1);
    });
  });

  describe('findByRouteId', () => {
    it('should return images for a specific route', async () => {
      mockImageService.findByRouteId.mockResolvedValue([testImages.image1]);

      const result = await controller.findByRouteId('route-id');

      expect(imageService.findByRouteId).toHaveBeenCalledWith('route-id');
      expect(result.success).toBe(true);
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update an image and return success response', async () => {
      const updateDto = { file_name: 'updated.png' };
      mockImageService.update.mockResolvedValue({
        ...testImages.image1,
        ...updateDto,
      });

      const result = await controller.update(testImages.image1.image_id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Image updated successfully');
    });
  });
});
