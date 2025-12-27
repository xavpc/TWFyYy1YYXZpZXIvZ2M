import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeeModule } from './employee/employee.module';
import { getTypeOrmConfig } from './config/typeorm.config';
import { DeviceModule } from './device/device.module';
import { DeviceLocationModule } from './device-location/device-location.module';
import { RouteModule } from './route/route.module';
import { RouteCoordinatesModule } from './route-coordinates/route-coordinates.module';
import { DeviceRouteModule } from './device-route/device-route.module';



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
    RouteModule,
    RouteCoordinatesModule,
    DeviceRouteModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}