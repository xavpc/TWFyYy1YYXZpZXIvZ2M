import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './employee/employee.module';
import { getTypeOrmConfig } from './config/typeorm.config';
import { DeviceModule } from './device/device.module';
import { DeviceLocationModule } from './device/subFeatureLocation/device-location.module';



@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule],
        useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    EmployeeModule,
    DeviceModule,
    DeviceLocationModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}