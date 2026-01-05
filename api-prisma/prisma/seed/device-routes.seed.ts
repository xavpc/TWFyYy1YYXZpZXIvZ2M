import { PrismaClient, DeviceRouteDay } from '@prisma/client';

export interface DeviceRouteSeedData {
  deviceIndex: number;
  routeIndex: number;
  day_assigned: DeviceRouteDay;
}

// Device route assignments - each device can have multiple routes on different days
export const deviceRoutesSeedData: DeviceRouteSeedData[] = [
  // Device 0 (Truck-001 - Taro) assignments
  { deviceIndex: 0, routeIndex: 0, day_assigned: 'monday' },    // Shibuya Downtown Route
  { deviceIndex: 0, routeIndex: 1, day_assigned: 'wednesday' }, // Shinjuku Station Area
  { deviceIndex: 0, routeIndex: 0, day_assigned: 'friday' },    // Shibuya Downtown Route

  // Device 1 (Truck-002 - Hanako) assignments
  { deviceIndex: 1, routeIndex: 2, day_assigned: 'monday' },    // Minato Residential Zone
  { deviceIndex: 1, routeIndex: 3, day_assigned: 'tuesday' },   // Chiyoda Business District
  { deviceIndex: 1, routeIndex: 2, day_assigned: 'thursday' },  // Minato Residential Zone

  // Device 2 (Truck-003 - Kenji) assignments
  { deviceIndex: 2, routeIndex: 4, day_assigned: 'tuesday' },   // Meguro Park Area
  { deviceIndex: 2, routeIndex: 5, day_assigned: 'thursday' },  // Setagaya Suburban Route
  { deviceIndex: 2, routeIndex: 4, day_assigned: 'saturday' },  // Meguro Park Area

  // Device 3 (Truck-004 - Yuki) assignments
  { deviceIndex: 3, routeIndex: 6, day_assigned: 'monday' },    // Ikebukuro Commercial Zone
  { deviceIndex: 3, routeIndex: 7, day_assigned: 'wednesday' }, // Ueno Cultural District
  { deviceIndex: 3, routeIndex: 6, day_assigned: 'friday' },    // Ikebukuro Commercial Zone

  // Device 5 (Van-001 - Akiko) assignments
  { deviceIndex: 5, routeIndex: 1, day_assigned: 'tuesday' },   // Shinjuku Station Area
  { deviceIndex: 5, routeIndex: 3, day_assigned: 'thursday' },  // Chiyoda Business District
  { deviceIndex: 5, routeIndex: 7, day_assigned: 'saturday' },  // Ueno Cultural District
];

export async function seedDeviceRoutes(
  prisma: PrismaClient,
  deviceIds: string[],
  routeIds: string[],
): Promise<string[]> {
  console.log('Seeding device routes...');
  const deviceRouteIds: string[] = [];

  for (const drData of deviceRoutesSeedData) {
    const deviceId = deviceIds[drData.deviceIndex];
    const routeId = routeIds[drData.routeIndex];

    if (!deviceId || !routeId) {
      console.log(
        `  Skipping device route: Missing device (${drData.deviceIndex}) or route (${drData.routeIndex})`,
      );
      continue;
    }

    try {
      const deviceRoute = await prisma.deviceRoute.create({
        data: {
          device_id: deviceId,
          route_id: routeId,
          day_assigned: drData.day_assigned,
        },
      });

      deviceRouteIds.push(deviceRoute.device_route_id);
      console.log(
        `  Created device route: Device ${drData.deviceIndex} -> Route ${drData.routeIndex} on ${drData.day_assigned}`,
      );
    } catch (error) {
      // Skip if unique constraint violated (route already assigned on that day)
      console.log(
        `  Skipped duplicate: Route ${drData.routeIndex} already assigned on ${drData.day_assigned}`,
      );
    }
  }

  console.log(`Seeded ${deviceRouteIds.length} device routes\n`);
  return deviceRouteIds;
}
