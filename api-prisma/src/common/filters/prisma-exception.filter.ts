import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected database error occurred';

    switch (exception.code) {
      case 'P2000':
        status = HttpStatus.BAD_REQUEST;
        message = `Value too long for column: ${exception.meta?.column_name || 'unknown'}`;
        break;

      case 'P2001':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;

      case 'P2002':
        status = HttpStatus.CONFLICT;
        const target = exception.meta?.target as string[] | undefined;
        message = `Unique constraint violation on: ${target?.join(', ') || 'unknown field'}`;
        break;

      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = `Foreign key constraint failed on: ${exception.meta?.field_name || 'unknown'}`;
        break;

      case 'P2014':
        status = HttpStatus.BAD_REQUEST;
        message = 'Required relation violation';
        break;

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = exception.meta?.cause as string || 'Record not found';
        break;

      default:
        this.logger.error(`Unhandled Prisma error: ${exception.code}`, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: this.getErrorName(status),
      prismaCode: exception.code,
      timestamp: new Date().toISOString(),
    });
  }

  private getErrorName(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      default:
        return 'Internal Server Error';
    }
  }
}
