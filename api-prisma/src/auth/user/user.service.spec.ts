import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockPrismaService, resetPrismaMocks } from '../../test/mocks/prisma.mock';
import { testUsers } from '../../test/fixtures';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    resetPrismaMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      username: 'newuser',
      password: 'Password123!',
      role: 'garbage_collector' as const,
    };

    it('should create user with valid data', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      prisma.users.create.mockResolvedValue({
        ...testUsers.admin,
        username: createUserDto.username,
      });

      const result = await service.create(createUserDto);

      expect(prisma.users.findFirst).toHaveBeenCalledWith({
        where: { username: createUserDto.username },
      });
      expect(prisma.users.create).toHaveBeenCalled();
      expect(result.username).toBe(createUserDto.username);
    });

    it('should reject duplicate username', async () => {
      prisma.users.findFirst.mockResolvedValue(testUsers.admin);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.users.create).not.toHaveBeenCalled();
    });

    it('should hash password before storing', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      prisma.users.create.mockResolvedValue(testUsers.admin);

      await service.create(createUserDto);

      const createCall = prisma.users.create.mock.calls[0][0];
      expect(createCall.data.hashed_password).toBeDefined();
      expect(createCall.data.hashed_password).not.toBe(createUserDto.password);
    });

    it('should reject when employee already has a user account', async () => {
      const dtoWithEmployee = {
        ...createUserDto,
        employee_id: 'existing-employee-id',
      };
      prisma.users.findFirst
        .mockResolvedValueOnce(null) // No username conflict
        .mockResolvedValueOnce(testUsers.collector1); // Employee already has account

      await expect(service.create(dtoWithEmployee)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [testUsers.admin, testUsers.collector1];
      prisma.users.findMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(prisma.users.findMany).toHaveBeenCalledWith({
        select: {
          user_id: true,
          username: true,
          role: true,
          status: true,
          employee: true,
        },
      });
    });

    it('should return empty array when no users exist', async () => {
      prisma.users.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return user by ID', async () => {
      prisma.users.findUnique.mockResolvedValue(testUsers.admin);

      const result = await service.findOne(testUsers.admin.user_id);

      expect(result).toEqual(testUsers.admin);
      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { user_id: testUsers.admin.user_id },
        select: {
          user_id: true,
          username: true,
          role: true,
          status: true,
          employee: true,
        },
      });
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUsername', () => {
    it('should return user by username', async () => {
      prisma.users.findFirst.mockResolvedValue(testUsers.admin);

      const result = await service.findByUsername(testUsers.admin.username);

      expect(result).toEqual(testUsers.admin);
      expect(prisma.users.findFirst).toHaveBeenCalledWith({
        where: { username: testUsers.admin.username },
        include: { employee: true },
      });
    });

    it('should throw NotFoundException for nonexistent username', async () => {
      prisma.users.findFirst.mockResolvedValue(null);

      await expect(service.findByUsername('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateUserDto = {
      username: 'updateduser',
    };

    it('should update user details', async () => {
      prisma.users.findUnique.mockResolvedValue(testUsers.admin);
      prisma.users.findFirst.mockResolvedValue(null);
      prisma.users.update.mockResolvedValue({
        ...testUsers.admin,
        ...updateUserDto,
      });

      const result = await service.update(testUsers.admin.user_id, updateUserDto);

      expect(result.username).toBe(updateUserDto.username);
      expect(prisma.users.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject duplicate username on update', async () => {
      prisma.users.findUnique.mockResolvedValue(testUsers.admin);
      prisma.users.findFirst.mockResolvedValue(testUsers.collector1);

      await expect(
        service.update(testUsers.admin.user_id, { username: 'existinguser' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash new password if provided', async () => {
      prisma.users.findUnique.mockResolvedValue(testUsers.admin);
      prisma.users.findFirst.mockResolvedValue(null);
      prisma.users.update.mockResolvedValue(testUsers.admin);

      await service.update(testUsers.admin.user_id, { password: 'newpassword' });

      const updateCall = prisma.users.update.mock.calls[0][0];
      expect(updateCall.data.hashed_password).toBeDefined();
    });

    it('should allow updating without changing password', async () => {
      prisma.users.findUnique.mockResolvedValue(testUsers.admin);
      prisma.users.findFirst.mockResolvedValue(null);
      prisma.users.update.mockResolvedValue({
        ...testUsers.admin,
        status: 'inactive',
      });

      await service.update(testUsers.admin.user_id, { status: 'inactive' });

      const updateCall = prisma.users.update.mock.calls[0][0];
      expect(updateCall.data.hashed_password).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should delete user by ID', async () => {
      prisma.users.findUnique.mockResolvedValue(testUsers.admin);
      prisma.users.delete.mockResolvedValue(testUsers.admin);

      await service.remove(testUsers.admin.user_id);

      expect(prisma.users.delete).toHaveBeenCalledWith({
        where: { user_id: testUsers.admin.user_id },
      });
    });

    it('should throw NotFoundException for invalid ID', async () => {
      prisma.users.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.users.delete).not.toHaveBeenCalled();
    });
  });

  describe('hashPassword', () => {
    it('should return hashed password', async () => {
      const password = 'testpassword';

      const hashedPassword = await service.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(await bcrypt.compare(password, hashedPassword)).toBe(true);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword';

      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });
});
