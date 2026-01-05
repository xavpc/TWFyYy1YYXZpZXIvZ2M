import { PrismaClient } from '@prisma/client';

// Import all seed functions
import { seedUsers } from './users.seed';
import { seedEmployees } from './employees.seed';
import { seedDevices } from './devices.seed';
import { seedRoutes } from './routes.seed';
import { seedRouteCoordinates } from './route-coordinates.seed';
import { seedCollectionPoints } from './collection-points.seed';
import { seedDeviceRoutes } from './device-routes.seed';
import { seedDeviceSessions } from './device-sessions.seed';
import { seedDeviceLocations } from './device-locations.seed';
import { seedCollectedPoints } from './collected-points.seed';
import { seedImages } from './images.seed';
import { seedComplaints } from './complaints.seed';
import { seedReports } from './reports.seed';

const prisma = new PrismaClient();

/**
 * Clears all data from the database in reverse dependency order
 */
async function clearDatabase(): Promise<void> {
  console.log('Clearing existing data...\n');

  // Delete in reverse dependency order to avoid foreign key violations
  await prisma.reports.deleteMany();
  await prisma.complaints.deleteMany();
  await prisma.collectedPoints.deleteMany();
  await prisma.deviceLocation.deleteMany();
  await prisma.deviceSession.deleteMany();
  await prisma.image.deleteMany();
  await prisma.deviceRoute.deleteMany();
  await prisma.collectionPoints.deleteMany();
  await prisma.routeCoordinates.deleteMany();
  await prisma.device.deleteMany();
  await prisma.route.deleteMany();
  await prisma.users.deleteMany();
  await prisma.employee.deleteMany();

  console.log('Database cleared successfully!\n');
}

/**
 * Main seed function that orchestrates all seeding operations
 * Seeds are executed in dependency order
 */
async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('  GARBAGE COLLECTION SYSTEM - DATABASE SEEDING');
  console.log('='.repeat(60));
  console.log();

  try {
    // Clear existing data
    await clearDatabase();

    console.log('Starting seed process...\n');
    console.log('-'.repeat(60));

    // Phase 1: Independent entities (no foreign key dependencies)
    console.log('\n[PHASE 1] Seeding independent entities...\n');

    const userIds = await seedUsers(prisma);
    const routeIds = await seedRoutes(prisma);

    // Phase 2: Entities dependent on Phase 1
    console.log('-'.repeat(60));
    console.log('\n[PHASE 2] Seeding dependent entities...\n');

    const employeeIds = await seedEmployees(prisma, userIds);
    const routeCoordinateIds = await seedRouteCoordinates(prisma, routeIds);
    const collectionPointIds = await seedCollectionPoints(prisma, routeIds);
    const imageIds = await seedImages(prisma, routeIds);

    // Phase 3: Entities dependent on Phase 2
    console.log('-'.repeat(60));
    console.log('\n[PHASE 3] Seeding device entities...\n');

    const deviceIds = await seedDevices(prisma, employeeIds);

    // Phase 4: Device routes (depends on devices and routes)
    console.log('-'.repeat(60));
    console.log('\n[PHASE 4] Seeding device route assignments...\n');

    const deviceRouteIds = await seedDeviceRoutes(prisma, deviceIds, routeIds);

    // Phase 5: Sessions and location tracking
    console.log('-'.repeat(60));
    console.log('\n[PHASE 5] Seeding sessions and tracking data...\n');

    const sessionIds = await seedDeviceSessions(prisma, deviceRouteIds);
    const deviceLocationIds = await seedDeviceLocations(
      prisma,
      deviceIds,
      sessionIds,
    );
    const collectedPointIds = await seedCollectedPoints(
      prisma,
      deviceIds,
      sessionIds,
      collectionPointIds,
    );

    // Phase 6: Complaints and Reports
    console.log('-'.repeat(60));
    console.log('\n[PHASE 6] Seeding complaints and reports...\n');

    const complaintIds = await seedComplaints(prisma, imageIds, deviceIds);
    const reportIds = await seedReports(prisma, sessionIds);

    // Summary
    console.log('='.repeat(60));
    console.log('\n  SEEDING COMPLETED SUCCESSFULLY!\n');
    console.log('='.repeat(60));
    console.log('\nSummary:');
    console.log(`  - Users:             ${userIds.length}`);
    console.log(`  - Employees:         ${employeeIds.length}`);
    console.log(`  - Devices:           ${deviceIds.length}`);
    console.log(`  - Routes:            ${routeIds.length}`);
    console.log(`  - Route Coordinates: ${routeCoordinateIds.length}`);
    console.log(`  - Collection Points: ${collectionPointIds.length}`);
    console.log(`  - Device Routes:     ${deviceRouteIds.length}`);
    console.log(`  - Device Sessions:   ${sessionIds.length}`);
    console.log(`  - Device Locations:  ${deviceLocationIds.length}`);
    console.log(`  - Collected Points:  ${collectedPointIds.length}`);
    console.log(`  - Images:            ${imageIds.length}`);
    console.log(`  - Complaints:        ${complaintIds.length}`);
    console.log(`  - Reports:           ${reportIds.length}`);
    console.log();

    // Print test credentials
    console.log('-'.repeat(60));
    console.log('\nTest Credentials:');
    console.log('  Admin:');
    console.log('    Username: admin');
    console.log('    Password: Admin@123');
    console.log('  Garbage Collector:');
    console.log('    Username: collector1');
    console.log('    Password: Collector@123');
    console.log();
  } catch (error) {
    console.error('\nError during seeding:', error);
    throw error;
  }
}

// Execute main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
