import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryConfig } from './config/cloudinary.config';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import { config } from 'dotenv';

config({
  path: process.env.NODE_ENV === 'production' ? '.env.online' : '.env'
});

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly welcomeTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NestJS</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f0f0f0;
        }
        .container {
            background-color: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
        }
        p {
            color: #666;
            margin-bottom: 1rem;
        }
        .api-url {
            background-color: #f8f9fa;
            padding: 0.5rem;
            border-radius: 4px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Your NestJS Application</h1>
        <p>Your application is running successfully!</p>
        <p>Base API URL: <span class="api-url"><%= baseUrl %></span></p>
        <p>Start building your awesome application.</p>
    </div>
</body>
</html>
  `;

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
    try {
      const baseUrl = this.configService.get('BASE_URL');
      return ejs.render(this.welcomeTemplate, { baseUrl });
    } catch (error) {
      console.error('Error rendering template:', error);
      return 'Error rendering welcome page';
    }
  }
}