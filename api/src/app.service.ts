import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private dataSource: DataSource) {}
  //just for testing the connection
  async onApplicationBootstrap() {
    try {
      const isConnected = this.dataSource.isInitialized;
      console.log('Database connection status:', isConnected ? 'Connected! 🚀' : 'Not connected ❌');
      await this.dataSource.query('SELECT 1');
      console.log('Successfully ran test query!');
    } catch (error) {
      console.error('Database connection error:', error);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}