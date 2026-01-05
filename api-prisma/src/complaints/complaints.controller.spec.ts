import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { testComplaints, testImages, testDevices, createDTOs } from '../test/fixtures';

describe('ComplaintsController', () => {
  let controller: ComplaintsController;
  let service: jest.Mocked<ComplaintsService>;

  const mockComplaintsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintsController],
      providers: [
        {
          provide: ComplaintsService,
          useValue: mockComplaintsService,
        },
      ],
    }).compile();

    controller = module.get<ComplaintsController>(ComplaintsController);
    service = module.get(ComplaintsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a complaint and return success response', async () => {
      const createDto = createDTOs.createComplaint;
      const complaintWithRelations = {
        ...testComplaints.complaint1,
        image: testImages.image1,
        device: testDevices.device1,
      };
      mockComplaintsService.create.mockResolvedValue(complaintWithRelations);

      const result = await controller.create(createDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Complaint created successfully');
    });
  });

  describe('findAll', () => {
    it('should return all complaints', async () => {
      const complaints = [testComplaints.complaint1, testComplaints.complaint2];
      mockComplaintsService.findAll.mockResolvedValue(complaints);

      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Complaints retrieved successfully');
      expect(result.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return a complaint by ID', async () => {
      mockComplaintsService.findOne.mockResolvedValue(testComplaints.complaint1);

      const result = await controller.findOne(testComplaints.complaint1.complaint_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Complaint retrieved successfully');
      expect(result.data).toEqual(testComplaints.complaint1);
    });
  });

  describe('update', () => {
    it('should update a complaint and return success response', async () => {
      const updateDto = { title: 'Updated Title' };
      mockComplaintsService.update.mockResolvedValue({
        ...testComplaints.complaint1,
        ...updateDto,
      });

      const result = await controller.update(testComplaints.complaint1.complaint_id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Complaint updated successfully');
    });
  });

  describe('remove', () => {
    it('should delete a complaint and return success response', async () => {
      mockComplaintsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(testComplaints.complaint1.complaint_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Complaint deleted successfully');
    });
  });
});
