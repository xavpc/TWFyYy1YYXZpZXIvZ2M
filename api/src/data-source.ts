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
import { CollectedPoints } from './collected-points/collected-points.entity';
import { Image } from './image/image.entity';
import { Complaints } from './complaints/complaints.entity';
import { User } from './auth/user/user.entity';

// Load the appropriate .env file based on NODE_ENV
config({
  path: process.env.NODE_ENV === 'production' ? '.env.online' : '.env'
});

const configService = new ConfigService();

export default new DataSource({
  ...getTypeOrmConfig(configService),
  entities: [
    Employee, 
    Device, 
    DeviceLocation, 
    Route, 
    RouteCoordinates, 
    DeviceRoute, 
    CollectionPoints,
    CollectedPoints,
    Image,
    Complaints,
    User
  
  ],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  subscribers: [],
});