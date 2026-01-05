/**
 * Test Fixtures for All Entities
 * Provides consistent test data across all unit and e2e tests
 */

import { Decimal } from '@prisma/client/runtime/library';

// =============================================================================
// USER FIXTURES
// =============================================================================

export const testUsers = {
  admin: {
    user_id: 'test-admin-user-id-00001',
    username: 'testadmin',
    hashed_password: '$2b$10$hashedpassword123456789',
    role: 'admin' as const,
    status: 'active' as const,
    employee_id: null,
  },
  collector1: {
    user_id: 'test-collector-user-id-001',
    username: 'testcollector1',
    hashed_password: '$2b$10$hashedpassword123456789',
    role: 'garbage_collector' as const,
    status: 'active' as const,
    employee_id: 'test-employee-id-00001',
  },
  collector2: {
    user_id: 'test-collector-user-id-002',
    username: 'testcollector2',
    hashed_password: '$2b$10$hashedpassword123456789',
    role: 'garbage_collector' as const,
    status: 'active' as const,
    employee_id: 'test-employee-id-00002',
  },
  inactiveUser: {
    user_id: 'test-inactive-user-id-001',
    username: 'inactiveuser',
    hashed_password: '$2b$10$hashedpassword123456789',
    role: 'garbage_collector' as const,
    status: 'inactive' as const,
    employee_id: null,
  },
};

// =============================================================================
// EMPLOYEE FIXTURES
// =============================================================================

export const testEmployees = {
  employee1: {
    employee_id: 'test-employee-id-00001',
    first_name: 'Taro',
    middle_name: null,
    last_name: 'Yamada',
    email: 'taro.yamada@test.com',
    contact_number: '090-1234-5678',
    address: 'Tokyo, Shibuya-ku, 1-2-3',
    age: 35,
    status: 'active' as const,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
  },
  employee2: {
    employee_id: 'test-employee-id-00002',
    first_name: 'Hanako',
    middle_name: 'Maria',
    last_name: 'Tanaka',
    email: 'hanako.tanaka@test.com',
    contact_number: '090-8765-4321',
    address: 'Osaka, Namba-ku, 4-5-6',
    age: 28,
    status: 'active' as const,
    created_at: new Date('2024-01-02T00:00:00Z'),
    updated_at: new Date('2024-01-02T00:00:00Z'),
  },
  inactiveEmployee: {
    employee_id: 'test-employee-id-00003',
    first_name: 'Inactive',
    middle_name: null,
    last_name: 'Employee',
    email: 'inactive.employee@test.com',
    contact_number: '090-0000-0000',
    address: 'Kyoto, Fushimi-ku, 7-8-9',
    age: 45,
    status: 'inactive' as const,
    created_at: new Date('2024-01-03T00:00:00Z'),
    updated_at: new Date('2024-01-03T00:00:00Z'),
  },
};

// =============================================================================
// DEVICE FIXTURES
// =============================================================================

export const testDevices = {
  device1: {
    device_id: 'test-device-id-00001',
    device_name: 'Truck-001',
    vehicle_plate_num: 'ABC-1234',
    status: 'active' as const,
    employee_id: 'test-employee-id-00001',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
  },
  device2: {
    device_id: 'test-device-id-00002',
    device_name: 'Truck-002',
    vehicle_plate_num: 'XYZ-5678',
    status: 'active' as const,
    employee_id: 'test-employee-id-00002',
    created_at: new Date('2024-01-02T00:00:00Z'),
    updated_at: new Date('2024-01-02T00:00:00Z'),
  },
  inactiveDevice: {
    device_id: 'test-device-id-00003',
    device_name: 'Truck-003',
    vehicle_plate_num: 'DEF-9999',
    status: 'inactive' as const,
    employee_id: 'test-employee-id-00003',
    created_at: new Date('2024-01-03T00:00:00Z'),
    updated_at: new Date('2024-01-03T00:00:00Z'),
  },
};

// =============================================================================
// ROUTE FIXTURES
// =============================================================================

export const testRoutes = {
  routeA: {
    route_id: 'test-route-id-00001',
    route_name: 'Downtown Route A',
    center_latitude: new Decimal(35.6762),
    center_longitude: new Decimal(139.6503),
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
  },
  routeB: {
    route_id: 'test-route-id-00002',
    route_name: 'Residential Route B',
    center_latitude: new Decimal(35.6892),
    center_longitude: new Decimal(139.6917),
    created_at: new Date('2024-01-02T00:00:00Z'),
    updated_at: new Date('2024-01-02T00:00:00Z'),
  },
  routeC: {
    route_id: 'test-route-id-00003',
    route_name: 'Industrial Zone C',
    center_latitude: new Decimal(35.7000),
    center_longitude: new Decimal(139.7500),
    created_at: new Date('2024-01-03T00:00:00Z'),
    updated_at: new Date('2024-01-03T00:00:00Z'),
  },
};

// =============================================================================
// ROUTE COORDINATES FIXTURES
// =============================================================================

export const testRouteCoordinates = {
  coordA1: {
    route_coordinates_id: 'test-coord-id-00001',
    latitude: new Decimal(35.6762),
    longitude: new Decimal(139.6503),
    sequence: 1,
    is_user_point: true,
    route_id: 'test-route-id-00001',
  },
  coordA2: {
    route_coordinates_id: 'test-coord-id-00002',
    latitude: new Decimal(35.6770),
    longitude: new Decimal(139.6510),
    sequence: 2,
    is_user_point: true,
    route_id: 'test-route-id-00001',
  },
  coordA3: {
    route_coordinates_id: 'test-coord-id-00003',
    latitude: new Decimal(35.6780),
    longitude: new Decimal(139.6520),
    sequence: 3,
    is_user_point: false,
    route_id: 'test-route-id-00001',
  },
  coordB1: {
    route_coordinates_id: 'test-coord-id-00004',
    latitude: new Decimal(35.6892),
    longitude: new Decimal(139.6917),
    sequence: 1,
    is_user_point: true,
    route_id: 'test-route-id-00002',
  },
};

// =============================================================================
// COLLECTION POINTS FIXTURES
// =============================================================================

export const testCollectionPoints = {
  pointA1: {
    collection_point_id: 'test-cp-id-00001',
    sequence: 1,
    collection_point_name: 'Point A-1 Station',
    latitude: new Decimal(35.6762),
    longitude: new Decimal(139.6503),
    route_id: 'test-route-id-00001',
  },
  pointA2: {
    collection_point_id: 'test-cp-id-00002',
    sequence: 2,
    collection_point_name: 'Point A-2 Mall',
    latitude: new Decimal(35.6770),
    longitude: new Decimal(139.6510),
    route_id: 'test-route-id-00001',
  },
  pointA3: {
    collection_point_id: 'test-cp-id-00003',
    sequence: 3,
    collection_point_name: 'Point A-3 Park',
    latitude: new Decimal(35.6780),
    longitude: new Decimal(139.6520),
    route_id: 'test-route-id-00001',
  },
  pointB1: {
    collection_point_id: 'test-cp-id-00004',
    sequence: 1,
    collection_point_name: 'Point B-1 Residence',
    latitude: new Decimal(35.6892),
    longitude: new Decimal(139.6917),
    route_id: 'test-route-id-00002',
  },
};

// =============================================================================
// DEVICE ROUTE FIXTURES
// =============================================================================

export const testDeviceRoutes = {
  deviceRoute1: {
    device_route_id: 'test-dr-id-00001',
    day_assigned: 'monday' as const,
    device_id: 'test-device-id-00001',
    route_id: 'test-route-id-00001',
  },
  deviceRoute2: {
    device_route_id: 'test-dr-id-00002',
    day_assigned: 'wednesday' as const,
    device_id: 'test-device-id-00001',
    route_id: 'test-route-id-00002',
  },
  deviceRoute3: {
    device_route_id: 'test-dr-id-00003',
    day_assigned: 'tuesday' as const,
    device_id: 'test-device-id-00002',
    route_id: 'test-route-id-00002',
  },
};

// =============================================================================
// DEVICE SESSION FIXTURES
// =============================================================================

export const testDeviceSessions = {
  activeSession: {
    session_id: 'test-session-id-00001',
    start: new Date('2024-01-15T08:00:00Z'),
    end: null,
    device_route_id: 'test-dr-id-00001',
  },
  completedSession: {
    session_id: 'test-session-id-00002',
    start: new Date('2024-01-14T08:00:00Z'),
    end: new Date('2024-01-14T14:00:00Z'),
    device_route_id: 'test-dr-id-00001',
  },
  oldSession: {
    session_id: 'test-session-id-00003',
    start: new Date('2024-01-10T08:00:00Z'),
    end: new Date('2024-01-10T12:00:00Z'),
    device_route_id: 'test-dr-id-00002',
  },
};

// =============================================================================
// DEVICE LOCATION FIXTURES
// =============================================================================

export const testDeviceLocations = {
  location1: {
    device_location_id: 'test-location-id-00001',
    latitude: new Decimal(35.6762),
    longitude: new Decimal(139.6503),
    push_timestamp: new Date('2024-01-15T08:05:00Z'),
    current_location_timestamp: new Date('2024-01-15T08:05:00Z'),
    device_id: 'test-device-id-00001',
    session_id: 'test-session-id-00001',
  },
  location2: {
    device_location_id: 'test-location-id-00002',
    latitude: new Decimal(35.6770),
    longitude: new Decimal(139.6510),
    push_timestamp: new Date('2024-01-15T08:10:00Z'),
    current_location_timestamp: new Date('2024-01-15T08:10:00Z'),
    device_id: 'test-device-id-00001',
    session_id: 'test-session-id-00001',
  },
  location3: {
    device_location_id: 'test-location-id-00003',
    latitude: new Decimal(35.6780),
    longitude: new Decimal(139.6520),
    push_timestamp: new Date('2024-01-15T08:15:00Z'),
    current_location_timestamp: new Date('2024-01-15T08:15:00Z'),
    device_id: 'test-device-id-00001',
    session_id: 'test-session-id-00001',
  },
};

// =============================================================================
// COLLECTED POINTS FIXTURES
// =============================================================================

export const testCollectedPoints = {
  collected1: {
    collected_point_id: 'test-collected-id-00001',
    push_timestamp: new Date('2024-01-14T09:00:00Z'),
    collected_timestamp: new Date('2024-01-14T09:00:00Z'),
    collection_point_id: 'test-cp-id-00001',
    device_id: 'test-device-id-00001',
    session_id: 'test-session-id-00002',
  },
  collected2: {
    collected_point_id: 'test-collected-id-00002',
    push_timestamp: new Date('2024-01-14T09:30:00Z'),
    collected_timestamp: new Date('2024-01-14T09:30:00Z'),
    collection_point_id: 'test-cp-id-00002',
    device_id: 'test-device-id-00001',
    session_id: 'test-session-id-00002',
  },
  collected3: {
    collected_point_id: 'test-collected-id-00003',
    push_timestamp: new Date('2024-01-14T10:00:00Z'),
    collected_timestamp: new Date('2024-01-14T10:00:00Z'),
    collection_point_id: 'test-cp-id-00003',
    device_id: 'test-device-id-00001',
    session_id: 'test-session-id-00002',
  },
};

// =============================================================================
// IMAGE FIXTURES
// =============================================================================

export const testImages = {
  image1: {
    image_id: 'test-image-id-00001',
    image_url: 'https://res.cloudinary.com/demo/image/upload/route_a_1.jpg',
    file_name: 'route_a_image_1.jpg',
    status: 'active' as const,
    route_id: 'test-route-id-00001',
  },
  image2: {
    image_id: 'test-image-id-00002',
    image_url: 'https://res.cloudinary.com/demo/image/upload/route_b_1.jpg',
    file_name: 'route_b_image_1.jpg',
    status: 'active' as const,
    route_id: 'test-route-id-00002',
  },
  inactiveImage: {
    image_id: 'test-image-id-00003',
    image_url: 'https://res.cloudinary.com/demo/image/upload/inactive.jpg',
    file_name: 'inactive_image.jpg',
    status: 'inactive' as const,
    route_id: 'test-route-id-00001',
  },
};

// =============================================================================
// COMPLAINTS FIXTURES
// =============================================================================

export const testComplaints = {
  complaint1: {
    complaint_id: 'test-complaint-id-00001',
    title: 'Blocked Road Access',
    description: 'Road blocked by construction, cannot access collection point',
    latitude: new Decimal(35.6762),
    longitude: new Decimal(139.6503),
    push_timestamp: new Date('2024-01-14T10:30:00Z'),
    complaint_timestamp: new Date('2024-01-14T10:30:00Z'),
    image_id: 'test-image-id-00001',
    device_id: 'test-device-id-00001',
  },
  complaint2: {
    complaint_id: 'test-complaint-id-00002',
    title: 'Overflowing Bin',
    description: 'Collection bin is overflowing and needs larger container',
    latitude: new Decimal(35.6892),
    longitude: new Decimal(139.6917),
    push_timestamp: new Date('2024-01-13T11:00:00Z'),
    complaint_timestamp: new Date('2024-01-13T11:00:00Z'),
    image_id: 'test-image-id-00002',
    device_id: 'test-device-id-00002',
  },
};

// =============================================================================
// REPORTS FIXTURES
// =============================================================================

export const testReports = {
  report1: {
    report_id: 'test-report-id-00001',
    route_name: 'Downtown Route A',
    vehicle_plate_number: 'ABC-1234',
    employee_name: 'Taro Yamada',
    report_timestamp: new Date('2024-01-14T14:05:00Z'),
    remarks: 'All points collected successfully',
    session_start_time: new Date('2024-01-14T08:00:00Z'),
    session_end_time: new Date('2024-01-14T14:00:00Z'),
    session_id: 'test-session-id-00002',
  },
  report2: {
    report_id: 'test-report-id-00002',
    route_name: 'Residential Route B',
    vehicle_plate_number: 'XYZ-5678',
    employee_name: 'Hanako Tanaka',
    report_timestamp: new Date('2024-01-10T12:05:00Z'),
    remarks: null,
    session_start_time: new Date('2024-01-10T08:00:00Z'),
    session_end_time: new Date('2024-01-10T12:00:00Z'),
    session_id: 'test-session-id-00003',
  },
};

// =============================================================================
// CREATE DTO FIXTURES
// =============================================================================

export const createDTOs = {
  createUser: {
    username: 'newuser',
    password: 'Password123!',
    role: 'garbage_collector' as const,
    status: 'active' as const,
    employee_id: 'test-employee-id-00001',
  },
  createEmployee: {
    first_name: 'New',
    middle_name: undefined,
    last_name: 'Employee',
    email: 'new.employee@test.com',
    contact_number: '090-1111-2222',
    address: 'Tokyo, Minato-ku, 1-1-1',
    age: 30,
    status: 'active' as const,
  },
  createDevice: {
    device_name: 'New-Truck-001',
    vehicle_plate_num: 'NEW-1111',
    status: 'active' as const,
    employee_id: 'test-employee-id-00001',
  },
  createRoute: {
    route_name: 'New Test Route',
    center_latitude: 35.6800,
    center_longitude: 139.7000,
  },
  createRouteCoordinate: {
    latitude: 35.6800,
    longitude: 139.7000,
    sequence: 1,
    is_user_point: true,
    route_id: 'test-route-id-00001',
  },
  createCollectionPoint: {
    sequence: 1,
    collection_point_name: 'New Collection Point',
    latitude: 35.6800,
    longitude: 139.7000,
    route_id: 'test-route-id-00001',
  },
  createDeviceRoute: {
    day_assigned: 'friday' as const,
    device_id: 'test-device-id-00001',
    route_id: 'test-route-id-00001',
  },
  createDeviceSession: {
    device_route_id: 'test-dr-id-00001',
  },
  createDeviceLocation: {
    latitude: 35.6800,
    longitude: 139.7000,
    current_location_timestamp: new Date().toISOString(),
    device_id: 'test-device-id-00001',
    session_id: 'test-session-id-00001',
  },
  createCollectedPoint: {
    collected_timestamp: new Date().toISOString(),
    collection_point_id: 'test-cp-id-00001',
    device_id: 'test-device-id-00001',
    session_id: 'test-session-id-00001',
  },
  createComplaint: {
    title: 'New Complaint Title',
    description: 'Description of the new complaint',
    latitude: 35.6800,
    longitude: 139.7000,
    complaint_timestamp: new Date().toISOString(),
    image_id: 'test-image-id-00001',
    device_id: 'test-device-id-00001',
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Creates a test user with optional overrides
 */
export function createTestUser(overrides?: Partial<typeof testUsers.admin>) {
  return { ...testUsers.admin, ...overrides };
}

/**
 * Creates a test employee with optional overrides
 */
export function createTestEmployee(overrides?: Partial<typeof testEmployees.employee1>) {
  return { ...testEmployees.employee1, ...overrides };
}

/**
 * Creates a test device with optional overrides
 */
export function createTestDevice(overrides?: Partial<typeof testDevices.device1>) {
  return { ...testDevices.device1, ...overrides };
}

/**
 * Creates a test route with optional overrides
 */
export function createTestRoute(overrides?: Partial<typeof testRoutes.routeA>) {
  return { ...testRoutes.routeA, ...overrides };
}

/**
 * Creates a test session with optional overrides
 */
export function createTestSession(overrides?: Partial<typeof testDeviceSessions.activeSession>) {
  return { ...testDeviceSessions.activeSession, ...overrides };
}

/**
 * Creates multiple test items for pagination tests
 */
export function createPaginatedList<T>(item: T, count: number): T[] {
  return Array.from({ length: count }, (_, i) => ({
    ...item,
    [`${Object.keys(item as object)[0]}`]: `generated-id-${i + 1}`,
  }));
}
