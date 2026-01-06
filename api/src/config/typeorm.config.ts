import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const getTypeOrmConfig = (configService: ConfigService): DataSourceOptions => ({
  type: 'mysql',
  host: configService.get('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  extra: {  
    charset: 'utf8mb4_unicode_ci',
  },
});