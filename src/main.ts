import * as Sentry from "@sentry/nestjs"
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RequestMethod } from '@nestjs/common';
import { SentryFilter } from "./sentry.filter";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

async function bootstrap() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: "production",
    integrations: [
      nodeProfilingIntegration(),
      Sentry.prismaIntegration(),
      Sentry.httpIntegration(),
    ],
    tracesSampleRate: 1.0,
  
    profilesSampleRate: 1.0,
  });

  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);

  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  app.enableCors();
  
  Sentry.setupNestErrorHandler(app, new SentryFilter(httpAdapter));
  app.useGlobalFilters(new SentryFilter(httpAdapter));
  
  if (process.env.APP_ENV == 'local') {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('Wallet Transaction API')
      .setDescription('The Wallet Transaction API description')
      .setVersion('0.1')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document, {
      jsonDocumentUrl: 'swagger/json',
    });
  }

  await app.listen(3000);
}
bootstrap();
