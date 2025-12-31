import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './Logging.interceptor';
import { createDatabaseIfNeeded } from './create-db'; 


async function bootstrap() {


    // Run the database auto-creation logic if databse not exist for testing app locally before starting NestJS.
    if (process.env.NODE_ENV !== 'production') {
      try {
        // This will ensure the target database exists before starting the application.
        await createDatabaseIfNeeded();
        console.log('Database check completed. Starting the application...');
      } catch (error) {
        console.error('Failed to create database:', error);
        process.exit(1);
      }
    } else {
      console.log('Production environment detected, skipping database auto-creation.');
    }
    const app = await NestFactory.create(AppModule
      , {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      });
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'https://gcweb-psi.vercel.app',
      'https://gc-web-one.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Garbage Collection Management API')
    .setDescription('API endpoints for managing Garbage Collectioon System data || Base route: https://gcbackend-temporary.onrender.com')
    .setVersion('1.0')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  document.tags = (document.tags || []).filter(tag => tag.name !== 'App');
  document.paths = Object.fromEntries(
    Object.entries(document.paths).filter(([_, endpoint]) => {
      return !Object.values(endpoint).some((operation: any) => operation.tags?.includes('App'));
    })
  );
  document.tags = [
    { name: 'FOR MOBILE USE', description: 'Endpoints intended for mobile applications' },
    ...(document.tags || []).filter(tag => tag.name !== 'FOR MOBILE USE'),
  ];

  SwaggerModule.setup('guide', app, document);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.BACKEND_PORT ?? 3001);
}
bootstrap();