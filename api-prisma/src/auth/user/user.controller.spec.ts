import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { testUsers, createDTOs } from '../../test/fixtures';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUsername: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and return success response', async () => {
      const createDto = createDTOs.createUser;
      const createdUser = { ...testUsers.admin, hashed_password: 'hashed' };
      mockUserService.create.mockResolvedValue(createdUser);

      const result = await controller.create(createDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User created successfully');
      expect(result.data).not.toHaveProperty('hashed_password');
    });
  });

  describe('findAll', () => {
    it('should return all users with success response', async () => {
      const users = [testUsers.admin, testUsers.collector1];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Users retrieved successfully');
      expect(result.data).toEqual(users);
      expect(result.total).toBe(2);
    });

    it('should return empty array when no users exist', async () => {
      mockUserService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      mockUserService.findOne.mockResolvedValue(testUsers.admin);

      const result = await controller.findOne(testUsers.admin.user_id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(testUsers.admin);
    });
  });

  describe('update', () => {
    it('should update a user and return success response', async () => {
      const updateDto = { username: 'newusername' };
      const updatedUser = { ...testUsers.admin, ...updateDto, hashed_password: 'hashed' };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(testUsers.admin.user_id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User updated successfully');
      expect(result.data).not.toHaveProperty('hashed_password');
    });
  });

  describe('remove', () => {
    it('should delete a user and return success response', async () => {
      mockUserService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(testUsers.admin.user_id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User deleted successfully');
      expect(userService.remove).toHaveBeenCalledWith(testUsers.admin.user_id);
    });
  });
});
