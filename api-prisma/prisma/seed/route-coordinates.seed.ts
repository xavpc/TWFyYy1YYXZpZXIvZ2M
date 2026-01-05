import { PrismaClient } from '@prisma/client';

export interface RouteCoordinateSeedData {
  routeIndex: number;
  sequence: number;
  latitude: number;
  longitude: number;
  is_user_point: boolean;
}

// Coordinates for each route (3-5 waypoints per route)
export const routeCoordinatesSeedData: RouteCoordinateSeedData[] = [
  // Shibuya Downtown Route (index 0)
  { routeIndex: 0, sequence: 1, latitude: 35.6580, longitude: 139.6990, is_user_point: true },
  { routeIndex: 0, sequence: 2, latitude: 35.6590, longitude: 139.7000, is_user_point: true },
  { routeIndex: 0, sequence: 3, latitude: 35.6600, longitude: 139.7010, is_user_point: false },
  { routeIndex: 0, sequence: 4, latitude: 35.6610, longitude: 139.7020, is_user_point: true },

  // Shinjuku Station Area (index 1)
  { routeIndex: 1, sequence: 1, latitude: 35.6880, longitude: 139.6990, is_user_point: true },
  { routeIndex: 1, sequence: 2, latitude: 35.6890, longitude: 139.7000, is_user_point: true },
  { routeIndex: 1, sequence: 3, latitude: 35.6900, longitude: 139.7010, is_user_point: false },
  { routeIndex: 1, sequence: 4, latitude: 35.6910, longitude: 139.7020, is_user_point: true },
  { routeIndex: 1, sequence: 5, latitude: 35.6920, longitude: 139.7030, is_user_point: false },

  // Minato Residential Zone (index 2)
  { routeIndex: 2, sequence: 1, latitude: 35.6570, longitude: 139.7440, is_user_point: true },
  { routeIndex: 2, sequence: 2, latitude: 35.6580, longitude: 139.7450, is_user_point: true },
  { routeIndex: 2, sequence: 3, latitude: 35.6590, longitude: 139.7460, is_user_point: true },

  // Chiyoda Business District (index 3)
  { routeIndex: 3, sequence: 1, latitude: 35.6920, longitude: 139.7520, is_user_point: true },
  { routeIndex: 3, sequence: 2, latitude: 35.6930, longitude: 139.7530, is_user_point: false },
  { routeIndex: 3, sequence: 3, latitude: 35.6940, longitude: 139.7540, is_user_point: true },
  { routeIndex: 3, sequence: 4, latitude: 35.6950, longitude: 139.7550, is_user_point: false },

  // Meguro Park Area (index 4)
  { routeIndex: 4, sequence: 1, latitude: 35.6400, longitude: 139.6970, is_user_point: true },
  { routeIndex: 4, sequence: 2, latitude: 35.6410, longitude: 139.6980, is_user_point: true },
  { routeIndex: 4, sequence: 3, latitude: 35.6420, longitude: 139.6990, is_user_point: true },

  // Setagaya Suburban Route (index 5)
  { routeIndex: 5, sequence: 1, latitude: 35.6450, longitude: 139.6520, is_user_point: true },
  { routeIndex: 5, sequence: 2, latitude: 35.6460, longitude: 139.6530, is_user_point: false },
  { routeIndex: 5, sequence: 3, latitude: 35.6470, longitude: 139.6540, is_user_point: true },
  { routeIndex: 5, sequence: 4, latitude: 35.6480, longitude: 139.6550, is_user_point: false },
  { routeIndex: 5, sequence: 5, latitude: 35.6490, longitude: 139.6560, is_user_point: true },

  // Ikebukuro Commercial Zone (index 6)
  { routeIndex: 6, sequence: 1, latitude: 35.7280, longitude: 139.7100, is_user_point: true },
  { routeIndex: 6, sequence: 2, latitude: 35.7290, longitude: 139.7110, is_user_point: true },
  { routeIndex: 6, sequence: 3, latitude: 35.7300, longitude: 139.7120, is_user_point: false },

  // Ueno Cultural District (index 7)
  { routeIndex: 7, sequence: 1, latitude: 35.7130, longitude: 139.7760, is_user_point: true },
  { routeIndex: 7, sequence: 2, latitude: 35.7140, longitude: 139.7770, is_user_point: true },
  { routeIndex: 7, sequence: 3, latitude: 35.7150, longitude: 139.7780, is_user_point: true },
  { routeIndex: 7, sequence: 4, latitude: 35.7160, longitude: 139.7790, is_user_point: false },
];

export async function seedRouteCoordinates(
  prisma: PrismaClient,
  routeIds: string[],
): Promise<string[]> {
  console.log('Seeding route coordinates...');
  const coordinateIds: string[] = [];

  for (const coordData of routeCoordinatesSeedData) {
    const routeId = routeIds[coordData.routeIndex];

    if (!routeId) {
      console.log(`  Skipping coordinate: No route at index ${coordData.routeIndex}`);
      continue;
    }

    const coordinate = await prisma.routeCoordinates.create({
      data: {
        route_id: routeId,
        sequence: coordData.sequence,
        latitude: coordData.latitude,
        longitude: coordData.longitude,
        is_user_point: coordData.is_user_point,
      },
    });

    coordinateIds.push(coordinate.route_coordinates_id);
  }

  console.log(`Seeded ${coordinateIds.length} route coordinates\n`);
  return coordinateIds;
}
