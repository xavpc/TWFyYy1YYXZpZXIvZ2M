import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryConfig } from './config/cloudinary.config';
import { ConfigService } from '@nestjs/config';

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
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Guide</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Poppins', sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background: #ffffff;
                text-align: center;
                color: #333;
            }
            .container {
                background: #fff;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                max-width: 400px;
                width: 90%;
            }
            h1 {
                font-size: 1.8rem;
                font-weight: 600;
                margin: 10px 0;
            }
            p {
                font-size: 1rem;
                font-weight: 300;
                margin: 5px 0;
            }
            a {
                color: #007bff;
                font-weight: 500;
                text-decoration: none;
                transition: 0.3s;
            }
            a:hover {
                color: #0056b3;
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Main Content -->
            <h1>Welcome to the API</h1>
            <p>This is the base URL: ${baseUrl}</p>
            <p>Goto <a href="${baseUrl}/guide">API Guide</a> for more details.</p>
        </div>
    </body>
    </html>
`;
  }
}