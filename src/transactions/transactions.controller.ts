import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionEntity } from './entities/transaction.entity';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { FindAllTransaction } from './dto/find-all-transaction.dto';
import * as Sentry from '@sentry/node';

@Controller('transactions')
@ApiTags('Transactions')
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  @ApiCreatedResponse({ type: TransactionEntity })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Res() res: Response,
  ) {
    try {
      const transaction =
        await this.transactionsService.create(createTransactionDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Transaction created successfully',
        data: transaction,
      });
    } catch (error) {
      Sentry.captureException(error);
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Post('topup')
  @ApiCreatedResponse({ type: TransactionEntity })
  async topup(
    @Body() createTransactionDto: CreateTransactionDto,
    @Res() res: Response,
  ) {
    try {
      const transaction =
        await this.transactionsService.topup(createTransactionDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Top Up successful',
        data: transaction,
      });
    } catch (error) {
      Sentry.captureException(error);
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  //TODO update Entity
  @Get('balance')
  @ApiQuery({ name: 'username' })
  @ApiOkResponse({ type: TransactionEntity, isArray: true })
  async getBalance(@Query('username') username: string, @Res() res: Response) {
    try {
      const balance = await this.transactionsService.getBalance(username);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Balance found successfully',
        data: balance,
      });
    } catch (error) {
      Sentry.captureException(error);

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  //TODO update Entity
  @Get('list-transaction')
  @ApiQuery({ name: 'username', required: false })
  @ApiQuery({ name: 'page', required: true, example: 1 })
  @ApiQuery({ name: 'pageSize', required: true, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  @ApiOkResponse({ type: TransactionEntity, isArray: true })
  async GetListTransaction(
    @Query() query: FindAllTransaction,
    @Res() res: Response,
  ) {
    try {
      const { username, page, pageSize, search } = query;

      const transaction = await this.transactionsService.findAll(
        username,
        page,
        pageSize,
        search,
      );
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'List transaction found successfully',
        data: transaction,
      });
    } catch (error) {
      Sentry.captureException(error);

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  //TODO update Entity
  @Get('top-users')
  @ApiOkResponse({ type: TransactionEntity, isArray: true })
  async getTopUsers(@Res() res: Response) {
    try {
      const topUsers = await this.transactionsService.getTopUsers();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'topUsers found successfully',
        data: topUsers,
      });
    } catch (error) {
      Sentry.captureException(error);

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  //TODO update Entity
  @Get('top-transactions')
  @ApiQuery({ name: 'username' })
  @ApiOkResponse({ type: TransactionEntity, isArray: true })
  async getTopTransactions(
    @Query('username') username: string,
    @Res() res: Response,
  ) {
    try {
      const topTransactions =
        await this.transactionsService.getTopTransactions(username);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'topTransactions found successfully',
        data: topTransactions,
      });
    } catch (error) {
      Sentry.captureException(error);

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}
