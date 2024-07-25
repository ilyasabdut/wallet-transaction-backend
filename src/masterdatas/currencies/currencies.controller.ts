import { Controller, Get, Res, HttpStatus, Param } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { Response } from 'express';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('masterdata/currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOkResponse({ isArray: true })
  async findAll(@Res() res: Response) {
    try {
      const currency = await this.currenciesService.findAll();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Currency List found successfully',
        data: currency,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Get(':id')
  @ApiOkResponse({ isArray: true })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const currency = await this.currenciesService.findOne(+id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Currency List found successfully',
        data: currency,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}
