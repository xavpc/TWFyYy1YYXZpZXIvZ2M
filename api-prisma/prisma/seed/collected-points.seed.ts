import { PrismaClient } from '@prisma/client';

export interface CollectedPointSeedData {
  deviceIndex: number;
  sessionIndex: number;
  collectionPointIndex: number;
  minutesFromSessionStart: number;
}

// Collection records for completed sessions
export const collectedPointsSeedData: CollectedPointSeedData[] = [
  // Session 1 (Minato Monday) - collected 3 of 3 points
  { deviceIndex: 1, sessionIndex: 1, collectionPointIndex: 7, minutesFromSessionStart: 30 },   // Roppongi Hills
  { deviceIndex: 1, sessionIndex: 1, collectionPointIndex: 8, minutesFromSessionStart: 90 },   // Tokyo Tower Area
  { deviceIndex: 1, sessionIndex: 1, collectionPointIndex: 9, minutesFromSessionStart: 150 },  // Azabu Juban

  // Session 2 (Ikebukuro Monday) - collected 3 of 3 points
  { deviceIndex: 3, sessionIndex: 2, collectionPointIndex: 18, minutesFromSessionStart: 45 },  // Ikebukuro Station East
  { deviceIndex: 3, sessionIndex: 2, collectionPointIndex: 19, minutesFromSessionStart: 120 }, // Sunshine City
  { deviceIndex: 3, sessionIndex: 2, collectionPointIndex: 20, minutesFromSessionStart: 200 }, // Ikebukuro West Gate Park

  // Session 3 (Shinjuku Wednesday) - collected 2 of 3 points
  { deviceIndex: 0, sessionIndex: 3, collectionPointIndex: 4, minutesFromSessionStart: 40 },   // Shinjuku Station West
  { deviceIndex: 0, sessionIndex: 3, collectionPointIndex: 5, minutesFromSessionStart: 100 },  // Shinjuku Central Park

  // Session 4 (Chiyoda Tuesday) - collected all 4 points
  { deviceIndex: 1, sessionIndex: 4, collectionPointIndex: 10, minutesFromSessionStart: 25 },  // Tokyo Station Marunouchi
  { deviceIndex: 1, sessionIndex: 4, collectionPointIndex: 11, minutesFromSessionStart: 65 },  // Imperial Palace East Garden
  { deviceIndex: 1, sessionIndex: 4, collectionPointIndex: 12, minutesFromSessionStart: 105 }, // Otemachi Business Center
  { deviceIndex: 1, sessionIndex: 4, collectionPointIndex: 13, minutesFromSessionStart: 145 }, // Hibiya Park

  // Session 5 (Meguro Tuesday) - collected 2 of 2 points
  { deviceIndex: 2, sessionIndex: 5, collectionPointIndex: 14, minutesFromSessionStart: 60 },  // Meguro Station
  { deviceIndex: 2, sessionIndex: 5, collectionPointIndex: 15, minutesFromSessionStart: 150 }, // Institute for Nature Study

  // Session 6 (Setagaya Thursday) - collected 2 of 3 points
  { deviceIndex: 2, sessionIndex: 6, collectionPointIndex: 16, minutesFromSessionStart: 45 },  // Sangenjaya Station
  { deviceIndex: 2, sessionIndex: 6, collectionPointIndex: 17, minutesFromSessionStart: 180 }, // Komazawa Olympic Park

  // Session 7 (Ueno Wednesday) - collected 3 of 4 points
  { deviceIndex: 3, sessionIndex: 7, collectionPointIndex: 21, minutesFromSessionStart: 30 },  // Ueno Station
  { deviceIndex: 3, sessionIndex: 7, collectionPointIndex: 22, minutesFromSessionStart: 90 },  // Ueno Zoo Entrance
  { deviceIndex: 3, sessionIndex: 7, collectionPointIndex: 23, minutesFromSessionStart: 150 }, // Tokyo National Museum
];

export async function seedCollectedPoints(
  prisma: PrismaClient,
  deviceIds: string[],
  sessionIds: string[],
  collectionPointIds: string[],
): Promise<string[]> {
  console.log('Seeding collected points...');
  const collectedPointIds: string[] = [];

  // Get session start times
  const sessions = await prisma.deviceSession.findMany({
    where: {
      session_id: {
        in: sessionIds,
      },
    },
  });

  const sessionStartTimes = new Map<string, Date>();
  sessions.forEach((session) => {
    sessionStartTimes.set(session.session_id, session.start);
  });

  for (const cpData of collectedPointsSeedData) {
    const deviceId = deviceIds[cpData.deviceIndex];
    const sessionId = sessionIds[cpData.sessionIndex];
    const collectionPointId = collectionPointIds[cpData.collectionPointIndex];

    if (!deviceId || !sessionId || !collectionPointId) {
      console.log(
        `  Skipping collected point: Missing device (${cpData.deviceIndex}), session (${cpData.sessionIndex}), or collection point (${cpData.collectionPointIndex})`,
      );
      continue;
    }

    const sessionStart = sessionStartTimes.get(sessionId);
    if (!sessionStart) {
      continue;
    }

    const collectedTime = new Date(
      sessionStart.getTime() + cpData.minutesFromSessionStart * 60 * 1000,
    );

    try {
      const collectedPoint = await prisma.collectedPoints.create({
        data: {
          device_id: deviceId,
          session_id: sessionId,
          collection_point_id: collectionPointId,
          collected_timestamp: collectedTime,
        },
      });

      collectedPointIds.push(collectedPoint.collected_point_id);
    } catch (error) {
      // Skip if duplicate (collection point already collected in session)
      console.log(
        `  Skipped duplicate: Collection point ${cpData.collectionPointIndex} already collected in session ${cpData.sessionIndex}`,
      );
    }
  }

  console.log(`Seeded ${collectedPointIds.length} collected points\n`);
  return collectedPointIds;
}
