import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Request');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = req;
    const now = Date.now();

    this.logger.debug(`[${method}] ${url}`);
    this.logger.debug(`Body: ${JSON.stringify(body)}`);
    this.logger.debug(`Query: ${JSON.stringify(query)}`);
    this.logger.debug(`Params: ${JSON.stringify(params)}`);

    return next.handle().pipe(
      tap((response) => {
        const delay = Date.now() - now;
        this.logger.log(`[${method}] ${url} -> ${delay}ms`);
        this.logger.debug(`Response: ${JSON.stringify(response)}`);
      }),
      catchError((err) => {
        const delay = Date.now() - now;
        this.logger.error(
          `[${method}] ${url} FAILED after ${delay}ms - ${err.message}`
        );
        throw err;
      })
    );
  }
}
