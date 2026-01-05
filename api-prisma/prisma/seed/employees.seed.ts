import { PrismaClient, EmployeeStatus } from '@prisma/client';

export interface EmployeeSeedData {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  contact_number: string;
  address: string;
  age: number;
  status: EmployeeStatus;
}

export const employeesSeedData: EmployeeSeedData[] = [
  {
    first_name: 'Taro',
    middle_name: null,
    last_name: 'Yamada',
    email: 'taro.yamada@gomicollection.jp',
    contact_number: '090-1234-5678',
    address: '1-1-1 Shibuya, Shibuya-ku, Tokyo',
    age: 35,
    status: 'active',
  },
  {
    first_name: 'Hanako',
    middle_name: 'Maria',
    last_name: 'Tanaka',
    email: 'hanako.tanaka@gomicollection.jp',
    contact_number: '090-8765-4321',
    address: '2-2-2 Shinjuku, Shinjuku-ku, Tokyo',
    age: 28,
    status: 'active',
  },
  {
    first_name: 'Kenji',
    middle_name: null,
    last_name: 'Suzuki',
    email: 'kenji.suzuki@gomicollection.jp',
    contact_number: '090-1111-2222',
    address: '3-3-3 Minato-ku, Tokyo',
    age: 42,
    status: 'active',
  },
  {
    first_name: 'Yuki',
    middle_name: 'Elizabeth',
    last_name: 'Sato',
    email: 'yuki.sato@gomicollection.jp',
    contact_number: '090-3333-4444',
    address: '4-4-4 Chiyoda-ku, Tokyo',
    age: 31,
    status: 'active',
  },
  {
    first_name: 'Takeshi',
    middle_name: null,
    last_name: 'Watanabe',
    email: 'takeshi.watanabe@gomicollection.jp',
    contact_number: '090-5555-6666',
    address: '5-5-5 Meguro-ku, Tokyo',
    age: 45,
    status: 'inactive',
  },
  {
    first_name: 'Akiko',
    middle_name: null,
    last_name: 'Ito',
    email: 'akiko.ito@gomicollection.jp',
    contact_number: '090-7777-8888',
    address: '6-6-6 Setagaya-ku, Tokyo',
    age: 29,
    status: 'active',
  },
];

export async function seedEmployees(
  prisma: PrismaClient,
  userIds: string[],
): Promise<string[]> {
  console.log('Seeding employees...');
  const employeeIds: string[] = [];

  // Link garbage collectors to employees (skip admin users at index 0 and 1)
  const collectorUserIds = userIds.slice(2); // collector1, collector2, collector3, inactive_collector

  for (let i = 0; i < employeesSeedData.length; i++) {
    const empData = employeesSeedData[i];
    const userId = collectorUserIds[i] || null;

    const employee = await prisma.employee.create({
      data: {
        first_name: empData.first_name,
        middle_name: empData.middle_name,
        last_name: empData.last_name,
        email: empData.email,
        contact_number: empData.contact_number,
        address: empData.address,
        age: empData.age,
        status: empData.status,
      },
    });

    employeeIds.push(employee.employee_id);

    // Link user to employee if available
    if (userId) {
      await prisma.users.update({
        where: { user_id: userId },
        data: { employee_id: employee.employee_id },
      });
      console.log(
        `  Created employee: ${empData.first_name} ${empData.last_name} (linked to user)`,
      );
    } else {
      console.log(
        `  Created employee: ${empData.first_name} ${empData.last_name}`,
      );
    }
  }

  console.log(`Seeded ${employeeIds.length} employees\n`);
  return employeeIds;
}
