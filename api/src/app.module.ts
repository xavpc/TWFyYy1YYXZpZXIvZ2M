import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { CollectionPointsModule } from './collection-points/collection-points.module';
import { CollectedPointsModule } from './collected-points/collected-points.module';
import { LoggingMiddleware } from './Logging.middleware';
import { ImageModule } from './image/image.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { OsrmModule } from './third-party/routing-engine/osrm/osrm.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.online' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    EmployeeModule,
    DeviceModule,
    DeviceLocationModule,
    RouteModule,
    RouteCoordinatesModule,
    DeviceRouteModule,
    CollectionPointsModule,
    CollectedPointsModule,
    ImageModule,
    ComplaintsModule,
    OsrmModule
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*');
  }
}