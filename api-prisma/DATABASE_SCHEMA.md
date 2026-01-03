# Database Schema Documentation

> Generated for TypeORM to Prisma migration

## Database Information

- **Database Engine:** MySQL (InnoDB)
- **Character Set:** UTF-8 (default)
- **Generated From:** TypeORM Entities and Migrations

---

## Tables Overview

| Table Name | Primary Key | Description |
|------------|-------------|-------------|
| `users` | `user_id` (CHAR 36, UUID) | System users with roles |
| `employee` | `employee_id` (CHAR 36, UUID) | Employee information |
| `device` | `device_id` (CHAR 36, UUID) | Tracking devices |
| `device_session` | `session_id` (CHAR 36, UUID) | Device tracking sessions |
| `device_route` | `device_route_id` (CHAR 36, UUID) | Device-Route assignments by day |
| `device_location` | `device_location_id` (CHAR 36, UUID) | GPS location records |
| `route` | `route_id` (CHAR 36, UUID) | Collection routes |
| `route_coordinates` | `route_coordinates_id` (UUID) | Route path coordinates |
| `collection_points` | `collection_point_id` (CHAR 36, UUID) | Pickup locations on routes |
| `collected_points` | `collected_point_id` (CHAR 36, UUID) | Records of collected points |
| `image` | `image_id` (CHAR 36, UUID) | Route images |
| `complaints` | `complaint_id` (CHAR 36, UUID) | User complaints |
| `reports` | `report_id` (UUID) | Session reports |

---

## Detailed Table Schemas

### users

```sql
CREATE TABLE `users` (
  `user_id` varchar(36) NOT NULL PRIMARY KEY,
  `role` enum('admin', 'garbage_collector') NOT NULL,
  `username` varchar(255) NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
  `employee_id` char(36) NULL,
  UNIQUE INDEX `REL_9760615d88ed518196bb79ea03` (`employee_id`),
  FOREIGN KEY (`employee_id`) REFERENCES `employee`(`employee_id`) ON DELETE NO ACTION
)
```

### employee

```sql
CREATE TABLE `employee` (
  `employee_id` varchar(36) NOT NULL PRIMARY KEY,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contact_number` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `age` int NOT NULL,
  `status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
)
```

### device

```sql
CREATE TABLE `device` (
  `device_id` varchar(36) NOT NULL PRIMARY KEY,
  `device_name` varchar(255) NOT NULL,
  `vehicle_plate_num` varchar(255) NOT NULL,
  `status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `employee_id` char(36) NOT NULL,
  FOREIGN KEY (`employee_id`) REFERENCES `employee`(`employee_id`) ON DELETE CASCADE,
  CHECK (`device_id` <> '')
)
```

### device_session

```sql
CREATE TABLE `device_session` (
  `session_id` varchar(36) NOT NULL PRIMARY KEY,
  `start` timestamp NOT NULL,
  `end` timestamp NULL,
  `device_route_id` char(36) NOT NULL,
  FOREIGN KEY (`device_route_id`) REFERENCES `device_route`(`device_route_id`) ON DELETE CASCADE
)
```

### device_route

```sql
CREATE TABLE `device_route` (
  `device_route_id` varchar(36) NOT NULL PRIMARY KEY,
  `day_assigned` enum('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL,
  `device_id` char(36) NOT NULL,
  `route_id` char(36) NOT NULL,
  UNIQUE INDEX `IDX_e606bd98a6e5aa251617fde179` (`route_id`, `day_assigned`),
  FOREIGN KEY (`device_id`) REFERENCES `device`(`device_id`) ON DELETE CASCADE,
  FOREIGN KEY (`route_id`) REFERENCES `route`(`route_id`) ON DELETE CASCADE
)
```

### device_location

```sql
CREATE TABLE `device_location` (
  `device_location_id` varchar(36) NOT NULL PRIMARY KEY,
  `latitude` decimal(8,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `push_timestamp` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `current_location_timestamp` timestamp NOT NULL,
  `device_id` char(36) NOT NULL,
  `session_id` char(36) NOT NULL,
  FOREIGN KEY (`device_id`) REFERENCES `device`(`device_id`) ON DELETE CASCADE,
  FOREIGN KEY (`session_id`) REFERENCES `device_session`(`session_id`) ON DELETE CASCADE
)
```

### route

```sql
CREATE TABLE `route` (
  `route_id` varchar(36) NOT NULL PRIMARY KEY,
  `route_name` varchar(255) NOT NULL,
  `center_latitude` decimal(8,6) NOT NULL DEFAULT '35.676398',
  `center_longitude` decimal(9,6) NOT NULL DEFAULT '139.699326',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE INDEX `IDX_5e2df1067075729388a504db02` (`route_name`)
)
```

### route_coordinates

```sql
CREATE TABLE `route_coordinates` (
  `route_coordinates_id` varchar(36) NOT NULL PRIMARY KEY,
  `latitude` decimal(8,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `sequence` int NOT NULL,
  `is_user_point` tinyint NOT NULL DEFAULT 1,
  `route_id` char(36) NOT NULL,
  FOREIGN KEY (`route_id`) REFERENCES `route`(`route_id`) ON DELETE CASCADE
)
```

### collection_points

```sql
CREATE TABLE `collection_points` (
  `collection_point_id` varchar(36) NOT NULL PRIMARY KEY,
  `sequence` int NOT NULL,
  `collection_point_name` varchar(255) NOT NULL,
  `latitude` decimal(8,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `route_id` char(36) NOT NULL,
  FOREIGN KEY (`route_id`) REFERENCES `route`(`route_id`) ON DELETE CASCADE
)
```

### collected_points

```sql
CREATE TABLE `collected_points` (
  `collected_point_id` varchar(36) NOT NULL PRIMARY KEY,
  `push_timestamp` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `collected_timestamp` timestamp NOT NULL,
  `collection_point_id` char(36) NOT NULL,
  `device_id` char(36) NOT NULL,
  `session_id` char(36) NOT NULL,
  UNIQUE INDEX `IDX_f5758fb9a9cf67956ecf461eae` (`collection_point_id`, `session_id`),
  FOREIGN KEY (`collection_point_id`) REFERENCES `collection_points`(`collection_point_id`) ON DELETE CASCADE,
  FOREIGN KEY (`device_id`) REFERENCES `device`(`device_id`) ON DELETE CASCADE,
  FOREIGN KEY (`session_id`) REFERENCES `device_session`(`session_id`) ON DELETE CASCADE
)
```

### image

```sql
CREATE TABLE `image` (
  `image_id` varchar(36) NOT NULL PRIMARY KEY,
  `image_url` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
  `route_id` char(36) NOT NULL,
  FOREIGN KEY (`route_id`) REFERENCES `route`(`route_id`) ON DELETE CASCADE
)
```

### complaints

```sql
CREATE TABLE `complaints` (
  `complaint_id` varchar(36) NOT NULL PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `latitude` decimal(8,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `push_timestamp` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `complaint_timestamp` timestamp NOT NULL,
  `image_id` char(36) NOT NULL,
  `device_id` char(36) NOT NULL,
  UNIQUE INDEX `IDX_0b8e8ed84e51e1f05a1cc3f710` (`title`),
  FOREIGN KEY (`image_id`) REFERENCES `image`(`image_id`) ON DELETE CASCADE,
  FOREIGN KEY (`device_id`) REFERENCES `device`(`device_id`) ON DELETE CASCADE
)
```

### reports

```sql
CREATE TABLE `reports` (
  `report_id` varchar(36) NOT NULL PRIMARY KEY,
  `route_name` varchar(255) NOT NULL,
  `vehicle_plate_number` varchar(50) NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `report_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `remarks` text NULL,
  `session_start_time` timestamp NOT NULL,
  `session_end_time` timestamp NOT NULL,
  `session_id` char(36) NOT NULL,
  UNIQUE INDEX `REL_a38d50b0bf81ced11d7c025f31` (`session_id`),
  FOREIGN KEY (`session_id`) REFERENCES `device_session`(`session_id`) ON DELETE CASCADE
)
```

---

## Enum Types

### UserRole
- `admin`
- `garbage_collector`

### UserStatus / EmployeeStatus / DeviceStatus / ImageStatus
- `active`
- `inactive`

### DeviceRouteDay
- `sunday`
- `monday`
- `tuesday`
- `wednesday`
- `thursday`
- `friday`
- `saturday`

---

## Entity Relationship Diagram (Text)

```
Employee (1) ----< (N) Device
    |                    |
    |                    |----< (N) DeviceLocation
    |                    |----< (N) DeviceRoute ----< (N) DeviceSession
    |                    |----< (N) CollectedPoints        |
    |                    |----< (N) Complaints             |----< (N) DeviceLocation
    |                                  |                   |----< (N) CollectedPoints
    |                                  |                   |---- (1) Reports
    ---- (1) Users                     |
                                       |
Route (1) ----< (N) RouteCoordinates   |
    |                                  |
    |----< (N) CollectionPoints ----< (N) CollectedPoints
    |----< (N) Image ----< (N) Complaints
    |----< (N) DeviceRoute
```

---

## Foreign Key Cascade Rules

All foreign keys use `ON DELETE CASCADE` except:
- `users.employee_id` → `employee.employee_id` uses `ON DELETE NO ACTION`

---

## Indexes

| Table | Index Name | Columns | Type |
|-------|-----------|---------|------|
| `users` | `REL_9760615d88ed518196bb79ea03` | `employee_id` | UNIQUE |
| `device_route` | `IDX_e606bd98a6e5aa251617fde179` | `route_id`, `day_assigned` | UNIQUE |
| `route` | `IDX_5e2df1067075729388a504db02` | `route_name` | UNIQUE |
| `collected_points` | `IDX_f5758fb9a9cf67956ecf461eae` | `collection_point_id`, `session_id` | UNIQUE |
| `complaints` | `IDX_0b8e8ed84e51e1f05a1cc3f710` | `title` | UNIQUE |
| `reports` | `REL_a38d50b0bf81ced11d7c025f31` | `session_id` | UNIQUE |

---

## Notes for Prisma Migration

1. **UUID Generation**: All primary keys use UUID generated by TypeORM. Prisma will use `@default(uuid())`.

2. **Timestamps**:
   - `created_at` uses `@default(now())`
   - `updated_at` uses `@updatedAt`

3. **Decimal Precision**:
   - Latitude: `decimal(8,6)`
   - Longitude: `decimal(9,6)`

4. **Enums**: Should be defined as Prisma enums matching the MySQL enum values.

5. **Check Constraint**: `device` table has a check constraint that will need to be handled differently in Prisma.
