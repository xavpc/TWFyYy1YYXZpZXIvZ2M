# API Testing Checklist for api-prisma

This document provides a comprehensive guide for Claude Code to create test cases and dummy data for the Garbage Collection Management System API (api-prisma folder).

> **IMPORTANT**: Only work within the `api-prisma` folder. Do not modify any other folders in the project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites & Setup](#2-prerequisites--setup)
3. [Seed Data Creation Guide](#3-seed-data-creation-guide)
4. [Test Cases by Module](#4-test-cases-by-module)
5. [Test Utilities & Helpers](#5-test-utilities--helpers)
6. [Execution Order](#6-execution-order)

---

## 1. Project Overview

- **Framework**: NestJS 11 with Prisma ORM
- **Database**: MySQL
- **Port**: 3001 (configurable via `BACKEND_PORT`)
- **Test Framework**: Jest with ts-jest
- **Test Location**: `api-prisma/src/**/*.spec.ts` (unit) and `api-prisma/test/**/*.e2e-spec.ts` (e2e)

### Database Models (14 Total)

| Model | Description |
|-------|-------------|
| Users | Admin and garbage collector accounts |
| Employee | Employee records linked to Users |
| Device | Physical devices/vehicles |
| DeviceSession | Active collection sessions |
| DeviceLocation | GPS location history |
| DeviceRoute | Device-to-route assignments |
| Route | Collection routes |
| RouteCoordinates | GPS coordinates for routes |
| CollectionPoints | Collection locations |
| CollectedPoints | Collection visit records |
| Image | Cloudinary images |
| Complaints | Field worker issues |
| Reports | Session completion reports |

---

## 2. Prerequisites & Setup

### 2.1 Create Test Configuration Files

- [ ] Create `api-prisma/test/jest-e2e.json` if not exists
- [ ] Verify `api-prisma/package.json` has test scripts configured
- [ ] Create `api-prisma/src/test/setup.ts` for global test setup

### 2.2 Install Testing Dependencies (if missing)

```bash
cd api-prisma
npm install --save-dev @nestjs/testing supertest @types/supertest
```

### 2.3 Create Test Database Configuration

- [ ] Create `api-prisma/.env.test` for test environment variables
- [ ] Configure separate test database to avoid polluting development data

```env
DATABASE_URL="mysql://user:password@localhost:3306/gomicollection_test"
JWT_SECRET="test-jwt-secret"
API_KEY="test-api-key"
```

### 2.4 Create Prisma Test Setup

- [ ] Create `api-prisma/src/prisma/prisma-test.service.ts` for test database cleanup

---

## 3. Seed Data Creation Guide

### 3.1 Create Seed File Structure

Create the following files in `api-prisma/prisma/seed/`:

- [ ] `api-prisma/prisma/seed/index.ts` - Main seed orchestrator
- [ ] `api-prisma/prisma/seed/users.seed.ts` - User seed data
- [ ] `api-prisma/prisma/seed/employees.seed.ts` - Employee seed data
- [ ] `api-prisma/prisma/seed/devices.seed.ts` - Device seed data
- [ ] `api-prisma/prisma/seed/routes.seed.ts` - Route seed data
- [ ] `api-prisma/prisma/seed/route-coordinates.seed.ts` - Route coordinates
- [ ] `api-prisma/prisma/seed/collection-points.seed.ts` - Collection points
- [ ] `api-prisma/prisma/seed/device-routes.seed.ts` - Device route assignments
- [ ] `api-prisma/prisma/seed/device-sessions.seed.ts` - Sessions
- [ ] `api-prisma/prisma/seed/device-locations.seed.ts` - GPS locations
- [ ] `api-prisma/prisma/seed/collected-points.seed.ts` - Collection records
- [ ] `api-prisma/prisma/seed/images.seed.ts` - Images
- [ ] `api-prisma/prisma/seed/complaints.seed.ts` - Complaints
- [ ] `api-prisma/prisma/seed/reports.seed.ts` - Reports

### 3.2 Seed Data Creation Order (CRITICAL)

**Must be created in this exact sequence due to foreign key dependencies:**

```
1. Users (no dependencies)
2. Employees (depends on Users for garbage_collector role)
3. Devices (depends on Employees)
4. Routes (no dependencies)
5. RouteCoordinates (depends on Routes)
6. CollectionPoints (depends on Routes)
7. DeviceRoutes (depends on Devices + Routes)
8. DeviceSessions (depends on DeviceRoutes)
9. DeviceLocations (depends on Devices + DeviceSessions)
10. CollectedPoints (depends on Devices + CollectionPoints + DeviceSessions)
11. Images (depends on Routes)
12. Complaints (depends on Images + Devices)
13. Reports (depends on DeviceSessions)
```

### 3.3 Sample Seed Data

#### Users Seed Data
```typescript
// api-prisma/prisma/seed/users.seed.ts
export const usersSeedData = [
  {
    username: 'admin',
    password: 'hashedPassword123', // bcrypt hash
    role: 'admin',
    status: 'active',
  },
  {
    username: 'collector1',
    password: 'hashedPassword123',
    role: 'garbage_collector',
    status: 'active',
  },
  {
    username: 'collector2',
    password: 'hashedPassword123',
    role: 'garbage_collector',
    status: 'active',
  },
  {
    username: 'inactive_user',
    password: 'hashedPassword123',
    role: 'garbage_collector',
    status: 'inactive',
  },
];
```

#### Employees Seed Data
```typescript
// api-prisma/prisma/seed/employees.seed.ts
export const employeesSeedData = [
  {
    first_name: 'Taro',
    middle_name: null,
    last_name: 'Yamada',
    email: 'taro.yamada@test.com',
    phone: '090-1234-5678',
    address: 'Tokyo, Japan',
    age: 35,
    status: 'active',
    // user_id: link to collector1
  },
  {
    first_name: 'Hanako',
    middle_name: 'Maria',
    last_name: 'Tanaka',
    email: 'hanako.tanaka@test.com',
    phone: '090-8765-4321',
    address: 'Osaka, Japan',
    age: 28,
    status: 'active',
    // user_id: link to collector2
  },
  {
    first_name: 'Inactive',
    middle_name: null,
    last_name: 'Employee',
    email: 'inactive@test.com',
    phone: '090-0000-0000',
    address: 'Kyoto, Japan',
    age: 45,
    status: 'inactive',
    // user_id: null
  },
];
```

#### Devices Seed Data
```typescript
// api-prisma/prisma/seed/devices.seed.ts
export const devicesSeedData = [
  {
    device_name: 'Truck-001',
    vehicle_plate_num: 'ABC-1234',
    status: 'active',
    // employee_id: link to Taro
  },
  {
    device_name: 'Truck-002',
    vehicle_plate_num: 'XYZ-5678',
    status: 'active',
    // employee_id: link to Hanako
  },
  {
    device_name: 'Truck-003',
    vehicle_plate_num: 'DEF-9999',
    status: 'inactive',
    // employee_id: null
  },
];
```

#### Routes Seed Data
```typescript
// api-prisma/prisma/seed/routes.seed.ts
export const routesSeedData = [
  {
    route_name: 'Downtown Route A',
    center_latitude: 35.6762,
    center_longitude: 139.6503,
  },
  {
    route_name: 'Residential Route B',
    center_latitude: 35.6892,
    center_longitude: 139.6917,
  },
  {
    route_name: 'Industrial Zone C',
    center_latitude: 35.7000,
    center_longitude: 139.7500,
  },
];
```

#### Route Coordinates Seed Data
```typescript
// api-prisma/prisma/seed/route-coordinates.seed.ts
export const routeCoordinatesSeedData = [
  // Route A coordinates
  { sequence: 1, latitude: 35.6762, longitude: 139.6503, is_user_created: true },
  { sequence: 2, latitude: 35.6770, longitude: 139.6510, is_user_created: true },
  { sequence: 3, latitude: 35.6780, longitude: 139.6520, is_user_created: false },
  // Route B coordinates
  { sequence: 1, latitude: 35.6892, longitude: 139.6917, is_user_created: true },
  { sequence: 2, latitude: 35.6900, longitude: 139.6930, is_user_created: true },
];
```

#### Collection Points Seed Data
```typescript
// api-prisma/prisma/seed/collection-points.seed.ts
export const collectionPointsSeedData = [
  // Route A points
  { sequence: 1, name: 'Point A-1 Station', latitude: 35.6762, longitude: 139.6503 },
  { sequence: 2, name: 'Point A-2 Mall', latitude: 35.6770, longitude: 139.6510 },
  { sequence: 3, name: 'Point A-3 Park', latitude: 35.6780, longitude: 139.6520 },
  // Route B points
  { sequence: 1, name: 'Point B-1 Residence', latitude: 35.6892, longitude: 139.6917 },
  { sequence: 2, name: 'Point B-2 Apartment', latitude: 35.6900, longitude: 139.6930 },
];
```

#### Device Routes Seed Data
```typescript
// api-prisma/prisma/seed/device-routes.seed.ts
export const deviceRoutesSeedData = [
  { day_assigned: 'monday' },    // Device 1 -> Route A
  { day_assigned: 'wednesday' }, // Device 1 -> Route B
  { day_assigned: 'friday' },    // Device 1 -> Route A
  { day_assigned: 'tuesday' },   // Device 2 -> Route B
  { day_assigned: 'thursday' },  // Device 2 -> Route A
];
```

#### Device Sessions Seed Data
```typescript
// api-prisma/prisma/seed/device-sessions.seed.ts
export const deviceSessionsSeedData = [
  // Active session
  {
    session_start: new Date('2024-01-15T08:00:00Z'),
    session_end: null,
    // device_route_id: link
  },
  // Completed session
  {
    session_start: new Date('2024-01-14T08:00:00Z'),
    session_end: new Date('2024-01-14T14:00:00Z'),
    // device_route_id: link
  },
  // Old completed session
  {
    session_start: new Date('2024-01-10T08:00:00Z'),
    session_end: new Date('2024-01-10T12:00:00Z'),
    // device_route_id: link
  },
];
```

#### Device Locations Seed Data
```typescript
// api-prisma/prisma/seed/device-locations.seed.ts
export const deviceLocationsSeedData = [
  { latitude: 35.6762, longitude: 139.6503, push_timestamp: new Date() },
  { latitude: 35.6770, longitude: 139.6510, push_timestamp: new Date() },
  { latitude: 35.6780, longitude: 139.6520, push_timestamp: new Date() },
];
```

#### Collected Points Seed Data
```typescript
// api-prisma/prisma/seed/collected-points.seed.ts
export const collectedPointsSeedData = [
  { collected_timestamp: new Date('2024-01-14T09:00:00Z') },
  { collected_timestamp: new Date('2024-01-14T09:30:00Z') },
  { collected_timestamp: new Date('2024-01-14T10:00:00Z') },
];
```

#### Images Seed Data
```typescript
// api-prisma/prisma/seed/images.seed.ts
export const imagesSeedData = [
  {
    cloudinary_image_name: 'route_a_image_1',
    cloudinary_public_id: 'gomicollection/route_a_1',
    cloudinary_secure_url: 'https://res.cloudinary.com/demo/image/upload/sample1.jpg',
    status: 'active',
    // route_id: link
  },
  {
    cloudinary_image_name: 'route_b_image_1',
    cloudinary_public_id: 'gomicollection/route_b_1',
    cloudinary_secure_url: 'https://res.cloudinary.com/demo/image/upload/sample2.jpg',
    status: 'active',
    // route_id: link
  },
];
```

#### Complaints Seed Data
```typescript
// api-prisma/prisma/seed/complaints.seed.ts
export const complaintsSeedData = [
  {
    title: 'Blocked Road Access',
    description: 'Road blocked by construction, cannot access collection point',
    latitude: 35.6762,
    longitude: 139.6503,
    timestamp: new Date('2024-01-14T10:30:00Z'),
    // image_id: link
    // device_id: link
  },
  {
    title: 'Overflowing Bin',
    description: 'Collection bin is overflowing and needs larger container',
    latitude: 35.6892,
    longitude: 139.6917,
    timestamp: new Date('2024-01-13T11:00:00Z'),
    // image_id: link
    // device_id: link
  },
];
```

#### Reports Seed Data
```typescript
// api-prisma/prisma/seed/reports.seed.ts
export const reportsSeedData = [
  {
    employee_name: 'Taro Yamada',
    route_name: 'Downtown Route A',
    vehicle_plate_number: 'ABC-1234',
    session_start: new Date('2024-01-14T08:00:00Z'),
    session_end: new Date('2024-01-14T14:00:00Z'),
    total_collection_points: 3,
    collected_points_count: 3,
    remarks: 'All points collected successfully',
    // session_id: link
  },
];
```

### 3.4 Update package.json for Seeding

- [ ] Add seed script to `api-prisma/package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed/index.ts"
  },
  "scripts": {
    "seed": "npx prisma db seed",
    "seed:reset": "npx prisma migrate reset --force"
  }
}
```

---

## 4. Test Cases by Module

### 4.1 Authentication Module Tests

**File**: `api-prisma/src/auth/security/auth.service.spec.ts`

#### AuthService Unit Tests
- [ ] `login()` - Should authenticate valid user with correct credentials
- [ ] `login()` - Should reject invalid username
- [ ] `login()` - Should reject invalid password
- [ ] `login()` - Should reject inactive user
- [ ] `logout()` - Should clear JWT cookie
- [ ] `validateUser()` - Should return user for valid credentials
- [ ] `validateUser()` - Should return null for invalid credentials

**File**: `api-prisma/src/auth/user/user.service.spec.ts`

#### UserService Unit Tests
- [ ] `create()` - Should create user with valid data
- [ ] `create()` - Should reject duplicate username
- [ ] `create()` - Should hash password before storing
- [ ] `findAll()` - Should return all users
- [ ] `findOne()` - Should return user by ID
- [ ] `findOne()` - Should throw NotFoundException for invalid ID
- [ ] `update()` - Should update user details
- [ ] `update()` - Should hash new password if provided
- [ ] `remove()` - Should delete user by ID
- [ ] `remove()` - Should throw NotFoundException for invalid ID

**File**: `api-prisma/test/auth.e2e-spec.ts`

#### Auth E2E Tests
- [ ] `POST /auth/login` - Should return JWT on valid login
- [ ] `POST /auth/login` - Should return 401 without API key
- [ ] `POST /auth/login` - Should return 401 for invalid credentials
- [ ] `POST /auth/logout` - Should clear authentication
- [ ] `POST /users` - Should create user (admin only)
- [ ] `GET /users` - Should return all users
- [ ] `GET /users/:id` - Should return user by ID
- [ ] `PUT /users/:id` - Should update user
- [ ] `DELETE /users/:id` - Should delete user

---

### 4.2 Employee Module Tests

**File**: `api-prisma/src/employee/employee.service.spec.ts`

#### EmployeeService Unit Tests
- [ ] `create()` - Should create employee with valid data
- [ ] `create()` - Should reject invalid email format
- [ ] `create()` - Should reject age outside 18-100 range
- [ ] `create()` - Should reject name shorter than 2 characters
- [ ] `findAll()` - Should return all employees
- [ ] `findAll()` - Should apply pagination correctly
- [ ] `findAll()` - Should apply sorting correctly
- [ ] `findAll()` - Should filter by status
- [ ] `searchByField()` - Should search by name field
- [ ] `searchByField()` - Should search by email field
- [ ] `globalSearch()` - Should search across all fields
- [ ] `advancedSearch()` - Should combine multiple search criteria
- [ ] `findOne()` - Should return employee by ID
- [ ] `findOne()` - Should throw NotFoundException for invalid ID
- [ ] `update()` - Should update employee details
- [ ] `update()` - Should validate updated fields
- [ ] `remove()` - Should delete employee by ID
- [ ] `remove()` - Should handle cascade delete with devices

**File**: `api-prisma/test/employee.e2e-spec.ts`

#### Employee E2E Tests
- [ ] `POST /employees` - Should create employee
- [ ] `POST /employees` - Should return 400 for invalid data
- [ ] `GET /employees` - Should return all employees
- [ ] `GET /employees?page=1&limit=10` - Should paginate results
- [ ] `GET /employees?status=active` - Should filter by status
- [ ] `GET /employees?sort_by=first_name&sort_order=ASC` - Should sort results
- [ ] `GET /employees/search/:field/:value` - Should search by field
- [ ] `GET /employees/search?term=Taro` - Should global search
- [ ] `GET /employees/advanced-search` - Should advanced search
- [ ] `PUT /employees/:id` - Should update employee
- [ ] `DELETE /employees/:id` - Should delete employee

---

### 4.3 Device Module Tests

**File**: `api-prisma/src/device/device.service.spec.ts`

#### DeviceService Unit Tests
- [ ] `create()` - Should create device with valid data
- [ ] `create()` - Should create device without employee
- [ ] `create()` - Should link device to employee
- [ ] `findAll()` - Should return all devices
- [ ] `findAll()` - Should apply pagination
- [ ] `findAll()` - Should filter by status
- [ ] `findByEmployee()` - Should return devices for employee
- [ ] `globalSearch()` - Should search across all fields
- [ ] `searchByField()` - Should search specific field
- [ ] `advancedSearch()` - Should combine criteria
- [ ] `searchByEmployeeInfo()` - Should search by employee data
- [ ] `findOne()` - Should return device by ID
- [ ] `update()` - Should update device details
- [ ] `update()` - Should change employee assignment
- [ ] `remove()` - Should delete device
- [ ] `remove()` - Should handle cascade with sessions

**File**: `api-prisma/test/device.e2e-spec.ts`

#### Device E2E Tests
- [ ] `POST /devices` - Should create device
- [ ] `GET /devices` - Should return all devices
- [ ] `GET /devices?status=active` - Should filter
- [ ] `GET /devices/search/global?term=Truck` - Should global search
- [ ] `GET /devices/search/field/:field?value=xyz` - Should field search
- [ ] `POST /devices/search/advanced` - Should advanced search
- [ ] `POST /devices/search/employee` - Should search by employee
- [ ] `GET /devices/:id` - Should return device
- [ ] `GET /devices/employee/:employeeId` - Should return by employee
- [ ] `PUT /devices/:id` - Should update device
- [ ] `DELETE /devices/:id` - Should delete device

---

### 4.4 Route Module Tests

**File**: `api-prisma/src/route/route.service.spec.ts`

#### RouteService Unit Tests
- [ ] `create()` - Should create route with unique name
- [ ] `create()` - Should reject duplicate route name
- [ ] `findAll()` - Should return all routes
- [ ] `findAll()` - Should apply pagination
- [ ] `globalSearch()` - Should search by name
- [ ] `searchByField()` - Should search specific field
- [ ] `findByCoordinateRange()` - Should find routes in range
- [ ] `findByAssignedDevice()` - Should find routes for device
- [ ] `findByDay()` - Should find routes for day of week
- [ ] `getRoutesWithImageCount()` - Should include image count
- [ ] `getRouteStatistics()` - Should return statistics
- [ ] `findByName()` - Should find route by name
- [ ] `findOne()` - Should return route with relations
- [ ] `update()` - Should update route name
- [ ] `remove()` - Should delete route

**File**: `api-prisma/test/route.e2e-spec.ts`

#### Route E2E Tests
- [ ] `POST /routes` - Should create route
- [ ] `POST /routes` - Should reject duplicate name
- [ ] `GET /routes` - Should return all routes
- [ ] `GET /routes/search/global?term=Downtown` - Should search
- [ ] `GET /routes/search/field?field=route_name&value=A` - Should field search
- [ ] `GET /routes/search/coordinates` - Should find by coordinates
- [ ] `GET /routes/device/:deviceId` - Should get by device
- [ ] `GET /routes/day/:day` - Should get by day
- [ ] `GET /routes/analytics/with-image-count` - Should return with count
- [ ] `GET /routes/analytics/statistics` - Should return stats
- [ ] `GET /routes/name/:routeName` - Should find by name
- [ ] `GET /routes/:id` - Should return route
- [ ] `PUT /routes/:id` - Should update route
- [ ] `DELETE /routes/:id` - Should delete route

---

### 4.5 Route Coordinates Module Tests

**File**: `api-prisma/src/route-coordinates/route-coordinates.service.spec.ts`

#### RouteCoordinatesService Unit Tests
- [ ] `create()` - Should create coordinate
- [ ] `create()` - Should validate latitude (-90 to 90)
- [ ] `create()` - Should validate longitude (-180 to 180)
- [ ] `findAll()` - Should return all coordinates
- [ ] `findByRoute()` - Should return coordinates for route
- [ ] `findOne()` - Should return coordinate by ID
- [ ] `update()` - Should update coordinate
- [ ] `remove()` - Should delete coordinate

**File**: `api-prisma/test/route-coordinates.e2e-spec.ts`

#### RouteCoordinates E2E Tests
- [ ] `POST /route-coordinates` - Should create coordinate
- [ ] `GET /route-coordinates` - Should return all
- [ ] `GET /route-coordinates/route/:routeId` - Should return by route
- [ ] `GET /route-coordinates/:id` - Should return by ID
- [ ] `PUT /route-coordinates/:id` - Should update
- [ ] `DELETE /route-coordinates/:id` - Should delete

---

### 4.6 Collection Points Module Tests

**File**: `api-prisma/src/collection-points/collection-points.service.spec.ts`

#### CollectionPointsService Unit Tests
- [ ] `create()` - Should create collection point
- [ ] `create()` - Should validate coordinates
- [ ] `findAll()` - Should return all points
- [ ] `findByRoute()` - Should return points for route
- [ ] `findOne()` - Should return point by ID
- [ ] `update()` - Should update point
- [ ] `remove()` - Should delete point

**File**: `api-prisma/test/collection-points.e2e-spec.ts`

#### CollectionPoints E2E Tests
- [ ] `POST /collection-points` - Should create point
- [ ] `GET /collection-points` - Should return all
- [ ] `GET /collection-points/route/:routeId` - Should return by route
- [ ] `GET /collection-points/:id` - Should return by ID
- [ ] `PUT /collection-points/:id` - Should update
- [ ] `DELETE /collection-points/:id` - Should delete

---

### 4.7 Device Routes Module Tests

**File**: `api-prisma/src/device-route/device-route.service.spec.ts`

#### DeviceRouteService Unit Tests
- [ ] `create()` - Should create device-route assignment
- [ ] `create()` - Should validate day enum values
- [ ] `findAll()` - Should return all assignments
- [ ] `findByDevice()` - Should return routes for device
- [ ] `findByRoute()` - Should return devices for route
- [ ] `findByDay()` - Should return assignments for day
- [ ] `findOne()` - Should return assignment by ID
- [ ] `update()` - Should update assignment
- [ ] `remove()` - Should delete assignment

**File**: `api-prisma/test/device-route.e2e-spec.ts`

#### DeviceRoute E2E Tests
- [ ] `POST /device-routes` - Should create assignment
- [ ] `GET /device-routes` - Should return all
- [ ] `GET /device-routes/device/:deviceId` - Should return by device
- [ ] `GET /device-routes/route/:routeId` - Should return by route
- [ ] `GET /device-routes/:id` - Should return by ID
- [ ] `PUT /device-routes/:id` - Should update
- [ ] `DELETE /device-routes/:id` - Should delete

---

### 4.8 Device Session Module Tests

**File**: `api-prisma/src/device-session/device-session.service.spec.ts`

#### DeviceSessionService Unit Tests
- [ ] `create()` - Should create session
- [ ] `create()` - Should set session_start automatically
- [ ] `findAll()` - Should return all sessions
- [ ] `findAll()` - Should filter by date range
- [ ] `findAll()` - Should filter by device
- [ ] `findAll()` - Should filter by route
- [ ] `findAll()` - Should filter by active status
- [ ] `findOne()` - Should return session by ID
- [ ] `findByDeviceId()` - Should return sessions for device
- [ ] `findActiveSessionByDeviceId()` - Should return active session
- [ ] `findActiveSessions()` - Should return all active sessions
- [ ] `findSessionsByDate()` - Should return sessions for date
- [ ] `findByDeviceRoute()` - Should return by device route
- [ ] `findSessionsByRouteAndDate()` - Should filter by both
- [ ] `update()` - Should update session
- [ ] `endSession()` - Should set session_end
- [ ] `endActiveSessionByDeviceId()` - Should end active session
- [ ] `sessionHasReport()` - Should check report existence
- [ ] `findRecentlyEndedSessions()` - Should find recent ended
- [ ] `remove()` - Should delete session
- [ ] `removeAll()` - Should delete all sessions

**File**: `api-prisma/test/device-session.e2e-spec.ts`

#### DeviceSession E2E Tests
- [ ] `POST /device-sessions` - Should create session
- [ ] `GET /device-sessions` - Should return all
- [ ] `GET /device-sessions?startDate=X&endDate=Y` - Should filter by date
- [ ] `GET /device-sessions?deviceId=X` - Should filter by device
- [ ] `GET /device-sessions?active=true` - Should filter active
- [ ] `GET /device-sessions/:id` - Should return by ID
- [ ] `PUT /device-sessions/:id` - Should update
- [ ] `PUT /device-sessions/:id/end` - Should end session
- [ ] `DELETE /device-sessions/:id` - Should delete

---

### 4.9 Device Location Module Tests

**File**: `api-prisma/src/device-location/device-location.service.spec.ts`

#### DeviceLocationService Unit Tests
- [ ] `create()` - Should create location record
- [ ] `create()` - Should validate coordinates
- [ ] `findAll()` - Should return all locations
- [ ] `findByDevice()` - Should return locations for device
- [ ] `findBySession()` - Should return locations for session
- [ ] `findOne()` - Should return location by ID
- [ ] `findLatestByDevice()` - Should return latest location
- [ ] `remove()` - Should delete location

**File**: `api-prisma/test/device-location.e2e-spec.ts`

#### DeviceLocation E2E Tests
- [ ] `POST /device-locations` - Should create location
- [ ] `GET /device-locations` - Should return all
- [ ] `GET /device-locations/device/:deviceId` - Should return by device
- [ ] `GET /device-locations/session/:sessionId` - Should return by session
- [ ] `GET /device-locations/:id` - Should return by ID
- [ ] `DELETE /device-locations/:id` - Should delete

---

### 4.10 Collected Points Module Tests

**File**: `api-prisma/src/collected-points/collected-points.service.spec.ts`

#### CollectedPointsService Unit Tests
- [ ] `create()` - Should create collection record
- [ ] `create()` - Should set push_timestamp automatically
- [ ] `findAll()` - Should return all records
- [ ] `findByDevice()` - Should return records for device
- [ ] `findBySession()` - Should return records for session
- [ ] `isCollectionAlreadyCollected()` - Should check uniqueness
- [ ] `findOne()` - Should return record by ID
- [ ] `update()` - Should update record
- [ ] `remove()` - Should delete record

**File**: `api-prisma/test/collected-points.e2e-spec.ts`

#### CollectedPoints E2E Tests
- [ ] `POST /collected-points` - Should create record
- [ ] `POST /collected-points` - Should reject duplicate collection
- [ ] `GET /collected-points` - Should return all
- [ ] `GET /collected-points/:id` - Should return by ID
- [ ] `GET /collected-points/device/:deviceId` - Should return by device
- [ ] `GET /collected-points/session/:sessionId` - Should return by session
- [ ] `GET /collected-points/collection-point/:cpId/:sessionId` - Should check collected
- [ ] `PUT /collected-points/:id` - Should update
- [ ] `DELETE /collected-points/:id` - Should delete

---

### 4.11 Image Module Tests

**File**: `api-prisma/src/image/image.service.spec.ts`

#### ImageService Unit Tests
- [ ] `uploadImage()` - Should upload to Cloudinary
- [ ] `uploadImage()` - Should create database record
- [ ] `findOne()` - Should return image by ID
- [ ] `findByRoute()` - Should return images for route
- [ ] `update()` - Should update image status
- [ ] `remove()` - Should delete image and Cloudinary resource

**File**: `api-prisma/test/image.e2e-spec.ts`

#### Image E2E Tests
- [ ] `POST /images` - Should upload image
- [ ] `GET /images/:id` - Should return image
- [ ] `GET /images/route/:routeId` - Should return by route
- [ ] `PUT /images/:id` - Should update status
- [ ] `DELETE /images/:id` - Should delete image

---

### 4.12 Complaints Module Tests

**File**: `api-prisma/src/complaints/complaints.service.spec.ts`

#### ComplaintsService Unit Tests
- [ ] `create()` - Should create complaint
- [ ] `create()` - Should reject duplicate title
- [ ] `create()` - Should validate coordinates
- [ ] `findAll()` - Should return all complaints
- [ ] `findOne()` - Should return complaint by ID
- [ ] `update()` - Should update complaint
- [ ] `remove()` - Should delete complaint

**File**: `api-prisma/test/complaints.e2e-spec.ts`

#### Complaints E2E Tests
- [ ] `POST /complaints` - Should create complaint
- [ ] `POST /complaints` - Should reject duplicate title
- [ ] `GET /complaints` - Should return all
- [ ] `GET /complaints/:id` - Should return by ID
- [ ] `PUT /complaints/:id` - Should update
- [ ] `DELETE /complaints/:id` - Should delete

---

### 4.13 Reports Module Tests

**File**: `api-prisma/src/reports/reports.service.spec.ts`

#### ReportsService Unit Tests
- [ ] `create()` - Should create report from session
- [ ] `findAll()` - Should return all reports
- [ ] `findAll()` - Should apply pagination
- [ ] `findOne()` - Should return report by ID
- [ ] `update()` - Should update remarks
- [ ] `getReportsByDateRange()` - Should filter by date range
- [ ] `getReportsByRoute()` - Should filter by route name
- [ ] `getReportsByEmployee()` - Should filter by employee name
- [ ] `getReportsByVehicle()` - Should filter by plate number
- [ ] `exportToExcel()` - Should generate Excel file

**File**: `api-prisma/test/reports.e2e-spec.ts`

#### Reports E2E Tests
- [ ] `POST /reports/generate` - Should generate report
- [ ] `POST /reports/generate-pdf` - Should generate PDF
- [ ] `GET /reports` - Should return all
- [ ] `GET /reports?page=1&limit=10` - Should paginate
- [ ] `GET /reports/:id` - Should return by ID
- [ ] `PUT /reports/:id` - Should update
- [ ] `GET /reports/filter/by-date-range` - Should filter by date
- [ ] `GET /reports/filter/by-route` - Should filter by route
- [ ] `GET /reports/filter/by-employee` - Should filter by employee
- [ ] `GET /reports/filter/by-vehicle` - Should filter by vehicle

---

### 4.14 Scheduled Tasks Tests

**File**: `api-prisma/src/scheduled-tasks/auto-end-session.service.spec.ts`

#### AutoEndSessionService Unit Tests
- [ ] Should identify sessions exceeding timeout
- [ ] Should end expired sessions automatically
- [ ] Should not end active valid sessions

**File**: `api-prisma/src/scheduled-tasks/auto-report-generation.service.spec.ts`

#### AutoReportGenerationService Unit Tests
- [ ] Should find recently ended sessions
- [ ] Should generate reports for ended sessions
- [ ] Should skip sessions with existing reports

---

## 5. Test Utilities & Helpers

### 5.1 Create Test Helper Files

- [ ] Create `api-prisma/src/test/test-utils.ts`:

```typescript
// Test utilities
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';

export const createTestingModule = async (providers: any[]) => {
  return Test.createTestingModule({
    providers: [
      ...providers,
      {
        provide: PrismaService,
        useValue: mockPrismaService,
      },
    ],
  }).compile();
};

export const mockPrismaService = {
  users: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  employee: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  device: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  // ... Add for all models
};
```

- [ ] Create `api-prisma/src/test/fixtures.ts`:

```typescript
// Test fixtures
export const testUser = {
  user_id: 'test-user-id',
  username: 'testuser',
  role: 'admin',
  status: 'active',
};

export const testEmployee = {
  employee_id: 'test-employee-id',
  first_name: 'Test',
  last_name: 'Employee',
  email: 'test@test.com',
  status: 'active',
};

// ... Add for all entities
```

- [ ] Create `api-prisma/src/test/e2e-setup.ts`:

```typescript
// E2E test setup
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';

export const setupE2ETest = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
};

export const cleanupDatabase = async (prisma: PrismaService) => {
  // Clean in reverse dependency order
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
  await prisma.employee.deleteMany();
  await prisma.users.deleteMany();
};
```

### 5.2 Create Mock Services

- [ ] Create `api-prisma/src/test/mocks/cloudinary.mock.ts`:

```typescript
export const mockCloudinaryService = {
  uploadImage: jest.fn().mockResolvedValue({
    public_id: 'mock-public-id',
    secure_url: 'http://localhost/image.jpg',
  }),
  deleteImage: jest.fn().mockResolvedValue({ result: 'ok' }),
};
```

---

## 6. Execution Order

### Phase 1: Setup (Do First)

1. [ ] Install testing dependencies
2. [ ] Create test configuration files
3. [ ] Create test database configuration
4. [ ] Create test utilities and helpers
5. [ ] Create mock services

### Phase 2: Seed Data

1. [ ] Create seed file structure
2. [ ] Implement all seed data files
3. [ ] Create main seed orchestrator
4. [ ] Update package.json with seed scripts
5. [ ] Run seed to populate test database

### Phase 3: Unit Tests (In Order)

1. [ ] Auth module tests
2. [ ] User module tests
3. [ ] Employee module tests
4. [ ] Device module tests
5. [ ] Route module tests
6. [ ] Route Coordinates module tests
7. [ ] Collection Points module tests
8. [ ] Device Route module tests
9. [ ] Device Session module tests
10. [ ] Device Location module tests
11. [ ] Collected Points module tests
12. [ ] Image module tests
13. [ ] Complaints module tests
14. [ ] Reports module tests
15. [ ] Scheduled Tasks tests

### Phase 4: E2E Tests (In Order)

1. [ ] Auth E2E tests
2. [ ] User E2E tests
3. [ ] Employee E2E tests
4. [ ] Device E2E tests
5. [ ] Route E2E tests
6. [ ] Route Coordinates E2E tests
7. [ ] Collection Points E2E tests
8. [ ] Device Route E2E tests
9. [ ] Device Session E2E tests
10. [ ] Device Location E2E tests
11. [ ] Collected Points E2E tests
12. [ ] Image E2E tests
13. [ ] Complaints E2E tests
14. [ ] Reports E2E tests

### Phase 5: Verification

1. [ ] Run all unit tests: `npm test`
2. [ ] Run all E2E tests: `npm run test:e2e`
3. [ ] Generate coverage report: `npm run test:cov`
4. [ ] Verify coverage meets minimum threshold (aim for 80%+)

---

## Additional Notes

### Validation Rules Reference

| Field | Validation |
|-------|------------|
| Employee first/last name | 2-50 characters |
| Email | Valid email format |
| Age | 18-100 |
| Latitude | -90 to 90 |
| Longitude | -180 to 180 |
| Complaint title | Max 255 characters |
| Complaint description | Max 1000 characters |

### Enum Values Reference

| Enum | Values |
|------|--------|
| DeviceRouteDay | sunday, monday, tuesday, wednesday, thursday, friday, saturday |
| UserRole | admin, garbage_collector |
| EmployeeStatus | active, inactive |
| DeviceStatus | active, inactive |
| UserStatus | active, inactive |
| ImageStatus | active, inactive |

### Authentication Headers

```typescript
// API Key header (required for login)
{ 'x-api-key': 'your-api-key' }

// JWT header (required for protected routes)
{ 'Authorization': 'Bearer <jwt-token>' }
```

---

**Last Updated**: Generated for api-prisma codebase
**Target Framework**: NestJS 11 + Prisma 5.22 + Jest 30
