import { PrismaClient, ImageStatus } from '@prisma/client';

export interface ImageSeedData {
  routeIndex: number;
  image_url: string;
  file_name: string;
  status: ImageStatus;
}

// Sample images for routes (using placeholder URLs)
export const imagesSeedData: ImageSeedData[] = [
  // Shibuya Downtown Route images
  {
    routeIndex: 0,
    image_url: 'http://localhost/images/shibuya_station.jpg',
    file_name: 'shibuya_station.jpg',
    status: 'active',
  },
  {
    routeIndex: 0,
    image_url: 'http://localhost/images/hachiko_square.jpg',
    file_name: 'hachiko_square.jpg',
    status: 'active',
  },

  // Shinjuku Station Area images
  {
    routeIndex: 1,
    image_url: 'http://localhost/images/shinjuku_west.jpg',
    file_name: 'shinjuku_west.jpg',
    status: 'active',
  },

  // Minato Residential Zone images
  {
    routeIndex: 2,
    image_url: 'http://localhost/images/roppongi_hills.jpg',
    file_name: 'roppongi_hills.jpg',
    status: 'active',
  },
  {
    routeIndex: 2,
    image_url: 'http://localhost/images/tokyo_tower.jpg',
    file_name: 'tokyo_tower.jpg',
    status: 'active',
  },

  // Chiyoda Business District images
  {
    routeIndex: 3,
    image_url: 'http://localhost/images/tokyo_station.jpg',
    file_name: 'tokyo_station.jpg',
    status: 'active',
  },
  {
    routeIndex: 3,
    image_url: 'http://localhost/images/imperial_palace.jpg',
    file_name: 'imperial_palace.jpg',
    status: 'inactive',
  },

  // Meguro Park Area images
  {
    routeIndex: 4,
    image_url: 'http://localhost/images/meguro_station.jpg',
    file_name: 'meguro_station.jpg',
    status: 'active',
  },

  // Setagaya Suburban Route images
  {
    routeIndex: 5,
    image_url: 'http://localhost/images/sangenjaya.jpg',
    file_name: 'sangenjaya.jpg',
    status: 'active',
  },

  // Ikebukuro Commercial Zone images
  {
    routeIndex: 6,
    image_url: 'http://localhost/images/sunshine_city.jpg',
    file_name: 'sunshine_city.jpg',
    status: 'active',
  },

  // Ueno Cultural District images
  {
    routeIndex: 7,
    image_url: 'http://localhost/images/ueno_park.jpg',
    file_name: 'ueno_park.jpg',
    status: 'active',
  },
  {
    routeIndex: 7,
    image_url: 'http://localhost/images/national_museum.jpg',
    file_name: 'national_museum.jpg',
    status: 'active',
  },
];

export async function seedImages(
  prisma: PrismaClient,
  routeIds: string[],
): Promise<string[]> {
  console.log('Seeding images...');
  const imageIds: string[] = [];

  for (const imageData of imagesSeedData) {
    const routeId = routeIds[imageData.routeIndex];

    if (!routeId) {
      console.log(
        `  Skipping image: No route at index ${imageData.routeIndex}`,
      );
      continue;
    }

    const image = await prisma.image.create({
      data: {
        route_id: routeId,
        image_url: imageData.image_url,
        file_name: imageData.file_name,
        status: imageData.status,
      },
    });

    imageIds.push(image.image_id);
    console.log(`  Created image: ${imageData.file_name}`);
  }

  console.log(`Seeded ${imageIds.length} images\n`);
  return imageIds;
}
