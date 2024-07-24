import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateCurrencyDto } from './dto/create-currency.dto';
// import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Injectable()
export class CurrenciesService {
  constructor(private prisma: PrismaService) {}

  // create(createCurrencyDto: CreateCurrencyDto) {
  //   return 'This action adds a new currency';
  // }

  async findAll() {
    const currency = await this.prisma.currency.findMany();
    return currency;
  }

  async findOne(id: number) {
    return await this.prisma.currency.findUnique({
      where: {
        id: id,
      },
    });
  }

  // update(id: number, updateCurrencyDto: UpdateCurrencyDto) {
  //   return `This action updates a #${id} currency`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} currency`;
  // }
}
