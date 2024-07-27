import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    
    // Determine the status code
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Create an error response object
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception instanceof HttpException ? exception.message : 'Internal server error',
    };

    // Capture the exception with Sentry
    Sentry.captureException(exception);
    Sentry.setExtra('statusCode', status);
    Sentry.setExtra('url', request.url);

    // Send the response
    response.status(status).json(errorResponse);
    
    // Call the parent class's catch method to ensure NestJS handles the exception
    super.catch(exception, host);
  }
}