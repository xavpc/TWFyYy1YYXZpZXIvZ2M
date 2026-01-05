import { PrismaClient } from '@prisma/client';

export interface CollectionPointSeedData {
  routeIndex: number;
  sequence: number;
  collection_point_name: string;
  latitude: number;
  longitude: number;
}

// Collection points for each route (2-4 points per route)
export const collectionPointsSeedData: CollectionPointSeedData[] = [
  // Shibuya Downtown Route (index 0)
  { routeIndex: 0, sequence: 1, collection_point_name: 'Shibuya Station North Exit', latitude: 35.6581, longitude: 139.6991 },
  { routeIndex: 0, sequence: 2, collection_point_name: 'Hachiko Square', latitude: 35.6590, longitude: 139.7003 },
  { routeIndex: 0, sequence: 3, collection_point_name: 'Shibuya 109 Building', latitude: 35.6601, longitude: 139.6993 },
  { routeIndex: 0, sequence: 4, collection_point_name: 'Shibuya Mark City', latitude: 35.6578, longitude: 139.6980 },

  // Shinjuku Station Area (index 1)
  { routeIndex: 1, sequence: 1, collection_point_name: 'Shinjuku Station West Exit', latitude: 35.6896, longitude: 139.6983 },
  { routeIndex: 1, sequence: 2, collection_point_name: 'Shinjuku Central Park', latitude: 35.6906, longitude: 139.6919 },
  { routeIndex: 1, sequence: 3, collection_point_name: 'Tokyo Metropolitan Building', latitude: 35.6896, longitude: 139.6917 },

  // Minato Residential Zone (index 2)
  { routeIndex: 2, sequence: 1, collection_point_name: 'Roppongi Hills', latitude: 35.6602, longitude: 139.7293 },
  { routeIndex: 2, sequence: 2, collection_point_name: 'Tokyo Tower Area', latitude: 35.6586, longitude: 139.7454 },
  { routeIndex: 2, sequence: 3, collection_point_name: 'Azabu Juban', latitude: 35.6543, longitude: 139.7369 },

  // Chiyoda Business District (index 3)
  { routeIndex: 3, sequence: 1, collection_point_name: 'Tokyo Station Marunouchi', latitude: 35.6812, longitude: 139.7671 },
  { routeIndex: 3, sequence: 2, collection_point_name: 'Imperial Palace East Garden', latitude: 35.6852, longitude: 139.7528 },
  { routeIndex: 3, sequence: 3, collection_point_name: 'Otemachi Business Center', latitude: 35.6864, longitude: 139.7634 },
  { routeIndex: 3, sequence: 4, collection_point_name: 'Hibiya Park', latitude: 35.6739, longitude: 139.7565 },

  // Meguro Park Area (index 4)
  { routeIndex: 4, sequence: 1, collection_point_name: 'Meguro Station', latitude: 35.6337, longitude: 139.7158 },
  { routeIndex: 4, sequence: 2, collection_point_name: 'Institute for Nature Study', latitude: 35.6381, longitude: 139.7215 },

  // Setagaya Suburban Route (index 5)
  { routeIndex: 5, sequence: 1, collection_point_name: 'Sangenjaya Station', latitude: 35.6437, longitude: 139.6708 },
  { routeIndex: 5, sequence: 2, collection_point_name: 'Komazawa Olympic Park', latitude: 35.6267, longitude: 139.6614 },
  { routeIndex: 5, sequence: 3, collection_point_name: 'Futako-Tamagawa', latitude: 35.6116, longitude: 139.6269 },

  // Ikebukuro Commercial Zone (index 6)
  { routeIndex: 6, sequence: 1, collection_point_name: 'Ikebukuro Station East Exit', latitude: 35.7295, longitude: 139.7130 },
  { routeIndex: 6, sequence: 2, collection_point_name: 'Sunshine City', latitude: 35.7290, longitude: 139.7193 },
  { routeIndex: 6, sequence: 3, collection_point_name: 'Ikebukuro West Gate Park', latitude: 35.7314, longitude: 139.7100 },

  // Ueno Cultural District (index 7)
  { routeIndex: 7, sequence: 1, collection_point_name: 'Ueno Station', latitude: 35.7141, longitude: 139.7774 },
  { routeIndex: 7, sequence: 2, collection_point_name: 'Ueno Zoo Entrance', latitude: 35.7167, longitude: 139.7718 },
  { routeIndex: 7, sequence: 3, collection_point_name: 'Tokyo National Museum', latitude: 35.7189, longitude: 139.7765 },
  { routeIndex: 7, sequence: 4, collection_point_name: 'Ameyoko Shopping Street', latitude: 35.7087, longitude: 139.7748 },
];

export async function seedCollectionPoints(
  prisma: PrismaClient,
  routeIds: string[],
): Promise<string[]> {
  console.log('Seeding collection points...');
  const collectionPointIds: string[] = [];

  for (const pointData of collectionPointsSeedData) {
    const routeId = routeIds[pointData.routeIndex];

    if (!routeId) {
      console.log(`  Skipping collection point: No route at index ${pointData.routeIndex}`);
      continue;
    }

    const collectionPoint = await prisma.collectionPoints.create({
      data: {
        route_id: routeId,
        sequence: pointData.sequence,
        collection_point_name: pointData.collection_point_name,
        latitude: pointData.latitude,
        longitude: pointData.longitude,
      },
    });

    collectionPointIds.push(collectionPoint.collection_point_id);
    console.log(`  Created collection point: ${pointData.collection_point_name}`);
  }

  console.log(`Seeded ${collectionPointIds.length} collection points\n`);
  return collectionPointIds;
}
