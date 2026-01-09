
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UseInterceptors } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;

    console.log(`[${new Date().toISOString()}] ${method} ${url}`);
    console.log('Request Body:', req.body);
    
    return next.handle().pipe(
      tap(response => {
        console.log('Response Body:', response);
      })
    );
  }
}

