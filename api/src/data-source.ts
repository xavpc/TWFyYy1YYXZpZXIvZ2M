import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { getTypeOrmConfig } from './config/typeorm.config';
import { Employee } from './employee/employee.entity';
import { Device } from './device/device.entity';
import { join } from 'path';
import { DeviceLocation } from './device-location/device-location.entity';
import { Route } from './route/route.entity';
import { RouteCoordinates } from './route-coordinates/route-coordinates.entity';
import { DeviceRoute } from './device-route/device-route.entity';

config();
const configService = new ConfigService();

export default new DataSource({
  ...getTypeOrmConfig(configService),
  entities: [Employee, Device, DeviceLocation, Route, RouteCoordinates, DeviceRoute],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  subscribers: [],
});