import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { getTypeOrmConfig } from './config/typeorm.config';
import { Employee } from './employee/employee.entity';
import { Device } from './device/device.entity';
import { join } from 'path';
import { DeviceLocation } from './device/subFeatureLocation/device-location.entity';

config();
const configService = new ConfigService();

export default new DataSource({
  ...getTypeOrmConfig(configService),
  entities: [Employee, Device, DeviceLocation],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  subscribers: [],
});