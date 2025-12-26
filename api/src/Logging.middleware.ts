
import { Injectable, MiddlewareConsumer, NestMiddleware, NestModule } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    console.log('Params:', req.params);
    next();
  }
}

