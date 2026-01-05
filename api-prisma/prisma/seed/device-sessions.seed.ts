import { PrismaClient } from '@prisma/client';

export interface DeviceSessionSeedData {
  deviceRouteIndex: number;
  start: Date;
  end: Date | null;
  description: string;
}

// Helper to create dates relative to now
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

export const deviceSessionsSeedData: DeviceSessionSeedData[] = [
  // Active session (currently in progress)
  {
    deviceRouteIndex: 0,
    start: new Date(today.getTime() + 8 * 60 * 60 * 1000), // Today at 8 AM
    end: null,
    description: 'Active session - Shibuya Monday',
  },

  // Completed sessions from yesterday
  {
    deviceRouteIndex: 3, // Minato Monday
    start: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000), // 8 AM
    end: new Date(yesterday.getTime() + 14 * 60 * 60 * 1000), // 2 PM
    description: 'Completed session - Minato Monday',
  },
  {
    deviceRouteIndex: 9, // Ikebukuro Monday
    start: new Date(yesterday.getTime() + 9 * 60 * 60 * 1000), // 9 AM
    end: new Date(yesterday.getTime() + 15 * 60 * 60 * 1000), // 3 PM
    description: 'Completed session - Ikebukuro Monday',
  },

  // Completed sessions from two days ago
  {
    deviceRouteIndex: 1, // Shinjuku Wednesday
    start: new Date(twoDaysAgo.getTime() + 7 * 60 * 60 * 1000), // 7 AM
    end: new Date(twoDaysAgo.getTime() + 12 * 60 * 60 * 1000), // 12 PM
    description: 'Completed session - Shinjuku Wednesday',
  },
  {
    deviceRouteIndex: 4, // Chiyoda Tuesday
    start: new Date(twoDaysAgo.getTime() + 8 * 60 * 60 * 1000), // 8 AM
    end: new Date(twoDaysAgo.getTime() + 13 * 60 * 60 * 1000), // 1 PM
    description: 'Completed session - Chiyoda Tuesday',
  },

  // Older completed sessions
  {
    deviceRouteIndex: 6, // Meguro Tuesday
    start: new Date(threeDaysAgo.getTime() + 8 * 60 * 60 * 1000),
    end: new Date(threeDaysAgo.getTime() + 14 * 60 * 60 * 1000),
    description: 'Completed session - Meguro Tuesday',
  },
  {
    deviceRouteIndex: 7, // Setagaya Thursday
    start: new Date(oneWeekAgo.getTime() + 9 * 60 * 60 * 1000),
    end: new Date(oneWeekAgo.getTime() + 16 * 60 * 60 * 1000),
    description: 'Completed session - Setagaya Thursday (week ago)',
  },
  {
    deviceRouteIndex: 10, // Ueno Wednesday
    start: new Date(oneWeekAgo.getTime() + 8 * 60 * 60 * 1000),
    end: new Date(oneWeekAgo.getTime() + 13 * 60 * 60 * 1000),
    description: 'Completed session - Ueno Wednesday (week ago)',
  },
];

export async function seedDeviceSessions(
  prisma: PrismaClient,
  deviceRouteIds: string[],
): Promise<string[]> {
  console.log('Seeding device sessions...');
  const sessionIds: string[] = [];

  for (const sessionData of deviceSessionsSeedData) {
    const deviceRouteId = deviceRouteIds[sessionData.deviceRouteIndex];

    if (!deviceRouteId) {
      console.log(
        `  Skipping session: No device route at index ${sessionData.deviceRouteIndex}`,
      );
      continue;
    }

    const session = await prisma.deviceSession.create({
      data: {
        device_route_id: deviceRouteId,
        start: sessionData.start,
        end: sessionData.end,
      },
    });

    sessionIds.push(session.session_id);
    console.log(`  Created session: ${sessionData.description}`);
  }

  console.log(`Seeded ${sessionIds.length} device sessions\n`);
  return sessionIds;
}
