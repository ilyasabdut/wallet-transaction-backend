import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CurrenciesModule } from './masterdatas/currencies/currencies.module';
import { AuthModule } from './auth/auth.module';
import { ExternalApisModule } from './external-apis/external-apis.module';
// import { SentryModule } from '@sentry/nestjs/setup';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    TransactionsModule,
    CurrenciesModule,
    ExternalApisModule,
    AuthModule,
    // SentryModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
