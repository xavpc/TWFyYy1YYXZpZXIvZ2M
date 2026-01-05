import { PrismaClient, DeviceStatus } from '@prisma/client';

export interface DeviceSeedData {
  device_name: string;
  vehicle_plate_num: string;
  status: DeviceStatus;
  employeeIndex: number; // Index into employeeIds array
}

export const devicesSeedData: DeviceSeedData[] = [
  {
    device_name: 'Truck-001',
    vehicle_plate_num: 'Tokyo 12-34',
    status: 'active',
    employeeIndex: 0, // Taro Yamada
  },
  {
    device_name: 'Truck-002',
    vehicle_plate_num: 'Tokyo 56-78',
    status: 'active',
    employeeIndex: 1, // Hanako Tanaka
  },
  {
    device_name: 'Truck-003',
    vehicle_plate_num: 'Tokyo 90-12',
    status: 'active',
    employeeIndex: 2, // Kenji Suzuki
  },
  {
    device_name: 'Truck-004',
    vehicle_plate_num: 'Tokyo 34-56',
    status: 'active',
    employeeIndex: 3, // Yuki Sato
  },
  {
    device_name: 'Truck-005',
    vehicle_plate_num: 'Tokyo 78-90',
    status: 'inactive',
    employeeIndex: 4, // Takeshi Watanabe (inactive)
  },
  {
    device_name: 'Van-001',
    vehicle_plate_num: 'Tokyo 11-22',
    status: 'active',
    employeeIndex: 5, // Akiko Ito
  },
];

export async function seedDevices(
  prisma: PrismaClient,
  employeeIds: string[],
): Promise<string[]> {
  console.log('Seeding devices...');
  const deviceIds: string[] = [];

  for (const deviceData of devicesSeedData) {
    const employeeId = employeeIds[deviceData.employeeIndex];

    if (!employeeId) {
      console.log(
        `  Skipping device ${deviceData.device_name}: No employee at index ${deviceData.employeeIndex}`,
      );
      continue;
    }

    const device = await prisma.device.create({
      data: {
        device_name: deviceData.device_name,
        vehicle_plate_num: deviceData.vehicle_plate_num,
        status: deviceData.status,
        employee_id: employeeId,
      },
    });

    deviceIds.push(device.device_id);
    console.log(
      `  Created device: ${deviceData.device_name} (${deviceData.vehicle_plate_num})`,
    );
  }

  console.log(`Seeded ${deviceIds.length} devices\n`);
  return deviceIds;
}
