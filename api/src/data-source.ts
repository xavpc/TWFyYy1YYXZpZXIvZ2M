// 3. src/data-source.ts
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { getTypeOrmConfig } from './config/typeorm.config';
import { Employee } from './employee/employee.entity';
import { Device } from './device/device.entity';
import { DeviceLocation } from './device-location/device-location.entity';
import { Route } from './route/route.entity';
import { RouteCoordinates } from './route-coordinates/route-coordinates.entity';
import { DeviceRoute } from './device-route/device-route.entity';
import { CollectionPoints } from './collection-points/collection-points.entity';
import { join } from 'path';
import { Image } from './image/image.entity';

// Load the appropriate .env file based on NODE_ENV
config({
  path: process.env.NODE_ENV === 'production' ? '.env.online' : '.env'
});

const configService = new ConfigService();

export default new DataSource({
  ...getTypeOrmConfig(configService),
  entities: [Employee, Device, DeviceLocation, Route, RouteCoordinates, DeviceRoute, CollectionPoints, Image],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  subscribers: [],
});