import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CurrenciesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.currency.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.currency.findUnique({
      where: {
        id: id,
      },
    });
  }

}
