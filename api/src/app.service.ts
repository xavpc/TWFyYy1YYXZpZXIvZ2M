// src/app.service.ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryConfig } from './config/cloudinary.config';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as ejs from 'ejs';
import { config } from 'dotenv';

config({
  path: process.env.NODE_ENV === 'production' ? '.env.online' : '.env'
});


@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService
  ) {
    cloudinary.config(getCloudinaryConfig(this.configService));
  }

  async onApplicationBootstrap() {
    // Database connection test
    try {
      const isConnected = this.dataSource.isInitialized;
      console.log('Database connection status:', isConnected ? 'Connected! 🚀' : 'Not connected ❌');
      await this.dataSource.query('SELECT 1');
      console.log('Successfully ran test query!');
    } catch (error) {
      console.error('Database connection error:', error);
    }

    // Add debug logging
    console.log('Cloudinary Config:', {
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
    });

    // Cloudinary connection test
    try {
      const result = await cloudinary.api.ping();
      console.log('Cloudinary connection status:', result.status === 'ok' ? 'Connected! ☁️' : 'Not connected ❌');
    } catch (error) {
      console.error('Cloudinary connection error:', error.message);
      console.log('Please check your Cloudinary credentials in .env file');
    }
  }

  getHello(): string {
    const baseUrl = this.configService.get('BASE_URL');
    
    const templatePath = path.join(process.cwd(), 'views', 'welcome.html');
    const template = fs.readFileSync(templatePath, 'utf-8');
    
    return ejs.render(template, { baseUrl });
  }
}