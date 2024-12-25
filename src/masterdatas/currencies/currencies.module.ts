import { Module } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  controllers: [CurrenciesController],
  providers: [CurrenciesService],
  imports: [PrismaModule],
  exports: [CurrenciesService],
})
export class CurrenciesModule {}
