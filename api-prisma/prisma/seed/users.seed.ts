import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface UserSeedData {
  username: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  employee_id?: string;
}

export const usersSeedData: UserSeedData[] = [
  {
    username: 'admin',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
  },
  {
    username: 'admin2',
    password: 'Admin@456',
    role: 'admin',
    status: 'active',
  },
  {
    username: 'collector1',
    password: 'Collector@123',
    role: 'garbage_collector',
    status: 'active',
  },
  {
    username: 'collector2',
    password: 'Collector@456',
    role: 'garbage_collector',
    status: 'active',
  },
  {
    username: 'collector3',
    password: 'Collector@789',
    role: 'garbage_collector',
    status: 'active',
  },
  {
    username: 'inactive_collector',
    password: 'Inactive@123',
    role: 'garbage_collector',
    status: 'inactive',
  },
];

export async function seedUsers(prisma: PrismaClient): Promise<string[]> {
  console.log('Seeding users...');
  const userIds: string[] = [];

  for (const userData of usersSeedData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.users.create({
      data: {
        username: userData.username,
        hashed_password: hashedPassword,
        role: userData.role,
        status: userData.status,
      },
    });

    userIds.push(user.user_id);
    console.log(`  Created user: ${userData.username} (${userData.role})`);
  }

  console.log(`Seeded ${userIds.length} users\n`);
  return userIds;
}
