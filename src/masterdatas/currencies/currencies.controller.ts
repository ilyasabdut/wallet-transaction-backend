import { Controller, Get, Res, HttpStatus} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import {Response} from 'express';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('masterdata/currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  // @Post()
  // create(@Body() createCurrencyDto: CreateCurrencyDto) {
  //   return this.currenciesService.create(createCurrencyDto);
  // }

  @Get()
  @ApiOkResponse({ isArray: true })
  async findAll(@Res() res: Response) {
    try{
    const currency = await this.currenciesService.findAll();
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'Currency found successfully',
      data: currency,
    });
  } catch (error) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: error.message,
    });
  }

  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.currenciesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCurrencyDto: UpdateCurrencyDto) {
  //   return this.currenciesService.update(+id, updateCurrencyDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.currenciesService.remove(+id);
  // }
}
