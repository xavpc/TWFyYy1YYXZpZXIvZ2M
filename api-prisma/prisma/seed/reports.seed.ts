import { PrismaClient } from '@prisma/client';

export interface ReportSeedData {
  sessionIndex: number;
  route_name: string;
  vehicle_plate_number: string;
  employee_name: string;
  remarks: string | null;
}

// Reports for completed sessions (not for active session at index 0)
export const reportsSeedData: ReportSeedData[] = [
  {
    sessionIndex: 1, // Minato Monday
    route_name: 'Minato Residential Zone',
    vehicle_plate_number: 'Tokyo 56-78',
    employee_name: 'Hanako Maria Tanaka',
    remarks: 'All collection points completed successfully. Encountered minor traffic delay near Roppongi.',
  },
  {
    sessionIndex: 2, // Ikebukuro Monday
    route_name: 'Ikebukuro Commercial Zone',
    vehicle_plate_number: 'Tokyo 34-56',
    employee_name: 'Yuki Elizabeth Sato',
    remarks: 'Completed on schedule. Sunshine City area had higher than normal volume.',
  },
  {
    sessionIndex: 3, // Shinjuku Wednesday
    route_name: 'Shinjuku Station Area',
    vehicle_plate_number: 'Tokyo 12-34',
    employee_name: 'Taro Yamada',
    remarks: 'Two of three collection points completed. Tokyo Metropolitan Building point was inaccessible due to event.',
  },
  {
    sessionIndex: 4, // Chiyoda Tuesday
    route_name: 'Chiyoda Business District',
    vehicle_plate_number: 'Tokyo 56-78',
    employee_name: 'Hanako Maria Tanaka',
    remarks: 'All four collection points completed. Imperial Palace area very clean.',
  },
  {
    sessionIndex: 5, // Meguro Tuesday
    route_name: 'Meguro Park Area',
    vehicle_plate_number: 'Tokyo 90-12',
    employee_name: 'Kenji Suzuki',
    remarks: null,
  },
  {
    sessionIndex: 6, // Setagaya Thursday
    route_name: 'Setagaya Suburban Route',
    vehicle_plate_number: 'Tokyo 90-12',
    employee_name: 'Kenji Suzuki',
    remarks: 'Two of three points collected. Futako-Tamagawa point skipped due to road closure.',
  },
  {
    sessionIndex: 7, // Ueno Wednesday
    route_name: 'Ueno Cultural District',
    vehicle_plate_number: 'Tokyo 34-56',
    employee_name: 'Yuki Elizabeth Sato',
    remarks: 'Three of four collection points completed. Ameyoko area skipped due to market congestion.',
  },
];

export async function seedReports(
  prisma: PrismaClient,
  sessionIds: string[],
): Promise<string[]> {
  console.log('Seeding reports...');
  const reportIds: string[] = [];

  // Get session details for start/end times
  const sessions = await prisma.deviceSession.findMany({
    where: {
      session_id: {
        in: sessionIds,
      },
    },
  });

  const sessionMap = new Map(sessions.map((s) => [s.session_id, s]));

  for (const reportData of reportsSeedData) {
    const sessionId = sessionIds[reportData.sessionIndex];

    if (!sessionId) {
      console.log(
        `  Skipping report: No session at index ${reportData.sessionIndex}`,
      );
      continue;
    }

    const session = sessionMap.get(sessionId);
    if (!session || !session.end) {
      console.log(
        `  Skipping report: Session ${reportData.sessionIndex} not found or not ended`,
      );
      continue;
    }

    try {
      const report = await prisma.reports.create({
        data: {
          session_id: sessionId,
          route_name: reportData.route_name,
          vehicle_plate_number: reportData.vehicle_plate_number,
          employee_name: reportData.employee_name,
          session_start_time: session.start,
          session_end_time: session.end,
          remarks: reportData.remarks,
        },
      });

      reportIds.push(report.report_id);
      console.log(`  Created report for: ${reportData.route_name}`);
    } catch (error) {
      // Skip if duplicate (session already has a report)
      console.log(
        `  Skipped duplicate: Report for session ${reportData.sessionIndex} already exists`,
      );
    }
  }

  console.log(`Seeded ${reportIds.length} reports\n`);
  return reportIds;
}
