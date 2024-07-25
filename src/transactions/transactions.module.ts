import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransactionRepository } from './transaction.repository';
import { CurrenciesService } from 'src/masterdatas/currencies/currencies.service';
import { UsersService } from 'src/users/users.service';
import { UserRepository } from 'src/users/users.repository';

@Module({
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionRepository,
    CurrenciesService,
    UsersService,
    UserRepository,
  ],
  imports: [PrismaModule],
})
export class TransactionsModule {}
