import { PrismaClient } from '@prisma/client';

export interface ComplaintSeedData {
  imageIndex: number;
  deviceIndex: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  daysAgo: number;
}

// Complaints with linked images and devices
export const complaintsSeedData: ComplaintSeedData[] = [
  {
    imageIndex: 0, // shibuya_station.jpg
    deviceIndex: 0, // Truck-001
    title: 'Blocked Road Access at Shibuya Station',
    description: 'Road blocked by construction work near the north exit. Cannot access collection point with the truck. Need to use alternate route.',
    latitude: 35.6581,
    longitude: 139.6991,
    daysAgo: 2,
  },
  {
    imageIndex: 2, // shinjuku_west.jpg
    deviceIndex: 0, // Truck-001
    title: 'Overflowing Bins at Shinjuku West',
    description: 'Multiple garbage bins are overflowing near the station. Recommend increasing collection frequency for this area.',
    latitude: 35.6896,
    longitude: 139.6983,
    daysAgo: 5,
  },
  {
    imageIndex: 3, // roppongi_hills.jpg
    deviceIndex: 1, // Truck-002
    title: 'Illegal Dumping at Roppongi Hills',
    description: 'Large items illegally dumped near the designated collection point. Items include old furniture and electronics.',
    latitude: 35.6602,
    longitude: 139.7293,
    daysAgo: 1,
  },
  {
    imageIndex: 5, // tokyo_station.jpg
    deviceIndex: 1, // Truck-002
    title: 'Damaged Bin at Tokyo Station',
    description: 'One of the collection bins is damaged and leaking. Needs immediate replacement to prevent contamination.',
    latitude: 35.6812,
    longitude: 139.7671,
    daysAgo: 3,
  },
  {
    imageIndex: 7, // meguro_station.jpg
    deviceIndex: 2, // Truck-003
    title: 'Parking Issue at Meguro Station',
    description: 'No parking available during morning hours due to commuter traffic. Suggest changing collection time to afternoon.',
    latitude: 35.6337,
    longitude: 139.7158,
    daysAgo: 7,
  },
  {
    imageIndex: 9, // sunshine_city.jpg
    deviceIndex: 3, // Truck-004
    title: 'Access Restriction at Sunshine City',
    description: 'New security measures restrict truck access during business hours. Need to coordinate with building management.',
    latitude: 35.7290,
    longitude: 139.7193,
    daysAgo: 4,
  },
  {
    imageIndex: 10, // ueno_park.jpg
    deviceIndex: 3, // Truck-004
    title: 'Special Event Impact at Ueno Park',
    description: 'Cherry blossom festival causing increased garbage volume. Additional collection runs may be necessary.',
    latitude: 35.7141,
    longitude: 139.7774,
    daysAgo: 10,
  },
];

export async function seedComplaints(
  prisma: PrismaClient,
  imageIds: string[],
  deviceIds: string[],
): Promise<string[]> {
  console.log('Seeding complaints...');
  const complaintIds: string[] = [];

  const now = new Date();

  for (const complaintData of complaintsSeedData) {
    const imageId = imageIds[complaintData.imageIndex];
    const deviceId = deviceIds[complaintData.deviceIndex];

    if (!imageId || !deviceId) {
      console.log(
        `  Skipping complaint: Missing image (${complaintData.imageIndex}) or device (${complaintData.deviceIndex})`,
      );
      continue;
    }

    const complaintTime = new Date(
      now.getTime() - complaintData.daysAgo * 24 * 60 * 60 * 1000,
    );

    try {
      const complaint = await prisma.complaints.create({
        data: {
          image_id: imageId,
          device_id: deviceId,
          title: complaintData.title,
          description: complaintData.description,
          latitude: complaintData.latitude,
          longitude: complaintData.longitude,
          complaint_timestamp: complaintTime,
        },
      });

      complaintIds.push(complaint.complaint_id);
      console.log(`  Created complaint: ${complaintData.title.substring(0, 40)}...`);
    } catch (error) {
      // Skip if duplicate title
      console.log(`  Skipped duplicate complaint title: ${complaintData.title.substring(0, 30)}...`);
    }
  }

  console.log(`Seeded ${complaintIds.length} complaints\n`);
  return complaintIds;
}
