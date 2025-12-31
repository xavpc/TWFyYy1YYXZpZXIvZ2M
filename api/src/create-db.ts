import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { getTypeOrmConfig } from './config/typeorm.config';

export async function createDatabaseIfNeeded(): Promise<void> {
  const configService = new ConfigService();
  const typeOrmConfig = getTypeOrmConfig(configService);
  
  if (typeOrmConfig.type !== 'mysql') {
    throw new Error('Auto-creation is only supported for MySQL.');
  }
  
  // Create a master connection to the default MySQL database
  const masterDataSource = new DataSource({
    ...typeOrmConfig,
    database: 'mysql', 
  });
  
  try {
    await masterDataSource.initialize();
    console.log('Connected to master database.');
    // Create the target database if it does not exist
    await masterDataSource.query(`CREATE DATABASE IF NOT EXISTS \`${typeOrmConfig.database}\``);
    console.log(`Database "${typeOrmConfig.database}" created successfully (or already exists).`);
  } catch (error) {
    console.error('Error creating database:', error.message);
    throw error;
  } finally {
    await masterDataSource.destroy();
  }
}
