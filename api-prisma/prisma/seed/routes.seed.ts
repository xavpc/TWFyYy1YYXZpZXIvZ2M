import { PrismaClient } from '@prisma/client';

export interface RouteSeedData {
  route_name: string;
  center_latitude: number;
  center_longitude: number;
}

export const routesSeedData: RouteSeedData[] = [
  {
    route_name: 'Shibuya Downtown Route',
    center_latitude: 35.6598,
    center_longitude: 139.7004,
  },
  {
    route_name: 'Shinjuku Station Area',
    center_latitude: 35.6896,
    center_longitude: 139.7006,
  },
  {
    route_name: 'Minato Residential Zone',
    center_latitude: 35.6586,
    center_longitude: 139.7454,
  },
  {
    route_name: 'Chiyoda Business District',
    center_latitude: 35.6939,
    center_longitude: 139.7535,
  },
  {
    route_name: 'Meguro Park Area',
    center_latitude: 35.6413,
    center_longitude: 139.6982,
  },
  {
    route_name: 'Setagaya Suburban Route',
    center_latitude: 35.6469,
    center_longitude: 139.6532,
  },
  {
    route_name: 'Ikebukuro Commercial Zone',
    center_latitude: 35.7295,
    center_longitude: 139.7109,
  },
  {
    route_name: 'Ueno Cultural District',
    center_latitude: 35.7141,
    center_longitude: 139.7774,
  },
];

export async function seedRoutes(prisma: PrismaClient): Promise<string[]> {
  console.log('Seeding routes...');
  const routeIds: string[] = [];

  for (const routeData of routesSeedData) {
    const route = await prisma.route.create({
      data: {
        route_name: routeData.route_name,
        center_latitude: routeData.center_latitude,
        center_longitude: routeData.center_longitude,
      },
    });

    routeIds.push(route.route_id);
    console.log(`  Created route: ${routeData.route_name}`);
  }

  console.log(`Seeded ${routeIds.length} routes\n`);
  return routeIds;
}
