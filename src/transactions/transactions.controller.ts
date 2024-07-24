import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionEntity } from './entities/transaction.entity';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {Response} from 'express';

@Controller('transactions')
@ApiTags('Transactions')

export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  @ApiCreatedResponse({ type: TransactionEntity })
  async create(@Body() createTransactionDto: CreateTransactionDto, @Res() res: Response) {
    try {
      const transaction = await this.transactionsService.create(createTransactionDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Transaction created successfully',
        data: transaction,
      });
    } catch (error) {
      console.log(error);
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Post('topup')
  @ApiCreatedResponse({ type: TransactionEntity })
  async topup(@Body() createTransactionDto: CreateTransactionDto,  @Res() res: Response) {
    try {
      const transaction = await this.transactionsService.topup(createTransactionDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'Top Up successful',
        data: transaction,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  //TODO update Entity
  @Get('balance')
  @ApiOkResponse({ type: TransactionEntity, isArray: true })
  async getBalance(@Res() res: Response) {
    try {
      const balance = await this.transactionsService.getBalance();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Balance found successfully',
        data: balance,
      });
    } catch (error) {
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
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

    //TODO update Entity
    @Get('top-transactions/:username')
    @ApiOkResponse({ type: TransactionEntity, isArray: true })
    async getTopTransactions(@Param('username') username: string, @Res() res: Response) {
      try {
        const topTransactions = await this.transactionsService.getTopTransactions(username);
        return res.status(HttpStatus.OK).json({
          statusCode: HttpStatus.OK,
          message: 'topTransactions found successfully',
          data: topTransactions,
        });
      } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        });
      }
    }
    
  // @Get()
  // findAll() {
  //   return this.transactionsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.transactionsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
  //   return this.transactionsService.update(+id, updateTransactionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.transactionsService.remove(+id);
  // }
}
