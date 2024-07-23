import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { username_from, username_to, currency_id, amount, type } = createTransactionDto;
    var notes = createTransactionDto.notes;

    const getUserFrom = await this.prisma.user.findUnique({
      where: {
        username: username_from,
      },
    });

    if (!getUserFrom) {
      throw new Error('User not found');
    }

    const getUserTo = await this.prisma.user.findUnique({
      where: {
        username: username_to,
      },
    });

    if (!getUserTo) {
      throw new Error('User not found');
    }

    if (getUserFrom.id === getUserTo.id) {
      throw new Error('User cannot send money to themselves');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if(type !== 'credit' && type !== 'debit') {
      throw new Error('Type must be credit or debit or topup');
    }

    if(!notes){
        notes = 'Transaction from ' + getUserFrom.username + 'to ' + getUserTo.username;
    }
    // Debit for the sender
    const debitTransaction = await this.prisma.transaction.create({
      data: {
        user_id: getUserFrom.id,
        from_user_id: getUserFrom.id,
        to_user_id: getUserTo.id,
        currency_id: currency_id,
        amount: -amount, // Debit amount is negative
        type: 'debit',
        notes: notes,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Credit for the receiver
    const creditTransaction = await this.prisma.transaction.create({
      data: {
        user_id: getUserTo.id,
        from_user_id: getUserFrom.id,
        to_user_id: getUserTo.id,
        currency_id: currency_id,
        amount: amount, // Credit amount is positive
        type: 'credit',
        notes: notes,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { debitTransaction, creditTransaction };
  }

  async topup(createTransactionDto: CreateTransactionDto) {
    const { username_to, currency_id, amount, type } = createTransactionDto;
    var notes = createTransactionDto.notes;

    const getUser = await this.prisma.user.findUnique({
      where: {
        username: username_to,
      },
    });

    if (!getUser) {
      throw new Error('User not found');
    }

    if (amount <= 0 || amount < 10000000) {
      throw new Error('Amount must be greater than 0 and less than 10000000');
    }

    if(type !== 'credit') {
      throw new Error('Type must be credit');
    }

    if(!notes){
        notes = 'Top up balance to ' + getUser.username;
    }

    const topupTransaction = await this.prisma.transaction.create({
      data: {
        user_id: getUser.id,
        to_user_id: getUser.id,
        currency_id: currency_id,
        amount: amount,
        type: type,
        notes: notes,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return topupTransaction;
  }


  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}