import { PrismaClient } from '@prisma/client';

export interface DeviceLocationSeedData {
  deviceIndex: number;
  sessionIndex: number;
  latitude: number;
  longitude: number;
  minutesFromSessionStart: number;
}

// Simulated GPS locations during sessions
export const deviceLocationsSeedData: DeviceLocationSeedData[] = [
  // Locations for active session (index 0) - Shibuya route
  { deviceIndex: 0, sessionIndex: 0, latitude: 35.6580, longitude: 139.6990, minutesFromSessionStart: 0 },
  { deviceIndex: 0, sessionIndex: 0, latitude: 35.6585, longitude: 139.6995, minutesFromSessionStart: 5 },
  { deviceIndex: 0, sessionIndex: 0, latitude: 35.6590, longitude: 139.7000, minutesFromSessionStart: 10 },
  { deviceIndex: 0, sessionIndex: 0, latitude: 35.6595, longitude: 139.7005, minutesFromSessionStart: 15 },
  { deviceIndex: 0, sessionIndex: 0, latitude: 35.6600, longitude: 139.7010, minutesFromSessionStart: 20 },

  // Locations for completed session (index 1) - Minato route
  { deviceIndex: 1, sessionIndex: 1, latitude: 35.6570, longitude: 139.7440, minutesFromSessionStart: 0 },
  { deviceIndex: 1, sessionIndex: 1, latitude: 35.6580, longitude: 139.7450, minutesFromSessionStart: 30 },
  { deviceIndex: 1, sessionIndex: 1, latitude: 35.6590, longitude: 139.7460, minutesFromSessionStart: 60 },
  { deviceIndex: 1, sessionIndex: 1, latitude: 35.6600, longitude: 139.7470, minutesFromSessionStart: 90 },

  // Locations for completed session (index 2) - Ikebukuro route
  { deviceIndex: 3, sessionIndex: 2, latitude: 35.7280, longitude: 139.7100, minutesFromSessionStart: 0 },
  { deviceIndex: 3, sessionIndex: 2, latitude: 35.7290, longitude: 139.7110, minutesFromSessionStart: 20 },
  { deviceIndex: 3, sessionIndex: 2, latitude: 35.7300, longitude: 139.7120, minutesFromSessionStart: 40 },

  // Locations for completed session (index 3) - Shinjuku route
  { deviceIndex: 0, sessionIndex: 3, latitude: 35.6880, longitude: 139.6990, minutesFromSessionStart: 0 },
  { deviceIndex: 0, sessionIndex: 3, latitude: 35.6890, longitude: 139.7000, minutesFromSessionStart: 15 },
  { deviceIndex: 0, sessionIndex: 3, latitude: 35.6900, longitude: 139.7010, minutesFromSessionStart: 30 },
  { deviceIndex: 0, sessionIndex: 3, latitude: 35.6910, longitude: 139.7020, minutesFromSessionStart: 45 },

  // Locations for completed session (index 4) - Chiyoda route
  { deviceIndex: 1, sessionIndex: 4, latitude: 35.6920, longitude: 139.7520, minutesFromSessionStart: 0 },
  { deviceIndex: 1, sessionIndex: 4, latitude: 35.6930, longitude: 139.7530, minutesFromSessionStart: 25 },
  { deviceIndex: 1, sessionIndex: 4, latitude: 35.6940, longitude: 139.7540, minutesFromSessionStart: 50 },

  // Locations for completed session (index 5) - Meguro route
  { deviceIndex: 2, sessionIndex: 5, latitude: 35.6400, longitude: 139.6970, minutesFromSessionStart: 0 },
  { deviceIndex: 2, sessionIndex: 5, latitude: 35.6410, longitude: 139.6980, minutesFromSessionStart: 30 },
  { deviceIndex: 2, sessionIndex: 5, latitude: 35.6420, longitude: 139.6990, minutesFromSessionStart: 60 },
];

export async function seedDeviceLocations(
  prisma: PrismaClient,
  deviceIds: string[],
  sessionIds: string[],
): Promise<string[]> {
  console.log('Seeding device locations...');
  const locationIds: string[] = [];

  // Get session start times
  const sessions = await prisma.deviceSession.findMany({
    where: {
      session_id: {
        in: sessionIds,
      },
    },
  });

  const sessionStartTimes = new Map<string, Date>();
  sessionIds.forEach((id, index) => {
    const session = sessions.find((s) => s.session_id === id);
    if (session) {
      sessionStartTimes.set(id, session.start);
    }
  });

  for (const locData of deviceLocationsSeedData) {
    const deviceId = deviceIds[locData.deviceIndex];
    const sessionId = sessionIds[locData.sessionIndex];

    if (!deviceId || !sessionId) {
      console.log(
        `  Skipping location: Missing device (${locData.deviceIndex}) or session (${locData.sessionIndex})`,
      );
      continue;
    }

    const sessionStart = sessionStartTimes.get(sessionId);
    if (!sessionStart) {
      continue;
    }

    const locationTime = new Date(
      sessionStart.getTime() + locData.minutesFromSessionStart * 60 * 1000,
    );

    const location = await prisma.deviceLocation.create({
      data: {
        device_id: deviceId,
        session_id: sessionId,
        latitude: locData.latitude,
        longitude: locData.longitude,
        current_location_timestamp: locationTime,
      },
    });

    locationIds.push(location.device_location_id);
  }

  console.log(`Seeded ${locationIds.length} device locations\n`);
  return locationIds;
}
