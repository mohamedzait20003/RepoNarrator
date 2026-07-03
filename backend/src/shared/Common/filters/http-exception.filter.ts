import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ApiErrorResponse {
  Message: string;
  Error: {
    Code: string;
    Type: string;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (((exceptionResponse as Record<string, unknown>).message as string) ??
          'Internal server error')
        : status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Internal server error'
          : String(exceptionResponse ?? '');

    const code =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (((exceptionResponse as Record<string, unknown>).error as string) ??
          HttpStatus[status])
        : HttpStatus[status];

    const body: ApiErrorResponse = {
      Message: Array.isArray(message) ? message.join('; ') : message,
      Error: {
        Code: code,
        Type: HttpStatus[status] ?? 'UnknownError',
      },
    };

    if (Number(status) >= 500) {
      this.logger.error(
        `${req.method} ${req.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    res.status(status).json(body);
  }
}
