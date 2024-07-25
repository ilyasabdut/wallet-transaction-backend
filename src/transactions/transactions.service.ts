import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionRepository } from './transaction.repository';
import { CurrenciesService } from 'src/masterdatas/currencies/currencies.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly currencyService: CurrenciesService,
    private readonly userService: UsersService,
    private readonly transactionRepo: TransactionRepository
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { username_from, username_to, currency_id, amount, type } = createTransactionDto;
    var notes = createTransactionDto.notes;

    const getCurrency = await this.currencyService.findOne(currency_id)

    if (!getCurrency) {
      throw new Error('Currency not found');
    }
    
    const getUserFrom = await this.userService.findOne(username_from)

    if (!getUserFrom) {
      throw new Error('User not found');
    }

  
    const getUserTo = await this.userService.findOne(username_to)

    if (!getUserTo) {
      throw new Error('User not found');
    }

    if (getUserFrom.id === getUserTo.id) {
      throw new Error('User cannot send money to themselves');
    }

    if (amount <= 0 && amount > 10000000) {
      throw new Error('Amount must be greater than 0 and less than 10000000');
    }

    await this.transactionRepo.isCurrencyMatch(getUserFrom.username, getCurrency.name, amount);


    if(type !== 'credit' && type !== 'debit') {
      throw new Error('Type must be credit or debit or topup');
    }

    if(!notes){
        notes = 'Transaction from ' + getUserFrom.username + ' to ' + getUserTo.username;
    }
    // Debit for the sender
    const debitTransaction = await this.transactionRepo.createTransaction({
        user_id: getUserFrom.id,
        from_user_id: getUserFrom.id,
        to_user_id: getUserTo.id,
        currency_id: currency_id,
        amount: -amount, // Debit amount is negative
        type: 'debit',
        notes: notes,
        created_at: new Date(),
        updated_at: new Date(),
    });

    // Credit for the receiver
    const creditTransaction = await this.transactionRepo.createTransaction({
        user_id: getUserTo.id,
        from_user_id: getUserFrom.id,
        to_user_id: getUserTo.id,
        currency_id: currency_id,
        amount: amount, // Credit amount is positive
        type: 'credit',
        notes: notes,
        created_at: new Date(),
        updated_at: new Date(),
    });

    return { debitTransaction, creditTransaction };
  }

  async topup(createTransactionDto: CreateTransactionDto) {
    const { username_to, currency_id, amount, type } = createTransactionDto;
    var notes = createTransactionDto.notes;

    const getUser = await this.userService.findOne(username_to)

    if (!getUser) {
      throw new Error('User not found');
    }

    if (amount <= 0 && amount > 10000000) {
      throw new Error('Amount must be greater than 0 and less than 10000000');
    }

    if(type !== 'credit') {
      throw new Error('Type must be credit');
    }

    if(!notes){
        notes = 'Top up balance to ' + getUser.username;
    }

    const topupTransaction = await this.transactionRepo.createTransaction({
        user_id: getUser.id,
        from_user_id: null,
        to_user_id: getUser.id,
        currency_id: currency_id,
        amount: amount,
        type: type,
        notes: notes,
        created_at: new Date(),
        updated_at: new Date(),
    });

    return topupTransaction;
  }

  async getBalance(username: string) {
    const getUser = await this.userService.findOne(username)

    if (!getUser) {
      throw new Error('User not found');
    }

    const balance = await this.transactionRepo.getUserBalanceByUsername(getUser.username);
    
    const result = balance.map((item) => {
      return {
        currency: item.currency_name,
        balance: item.total_amount,
      };
    });

    return result;
  }

  async getTopUsers() {
    try {
      const currency = await this.currencyService.findAll();
      let response = [];
      for (const curr of currency) {
        const topUsers = await this.transactionRepo.queryTopUsers(curr.name);
        response.push(
          {
            currency: curr.name,
            top_users: topUsers,
          }
        )
      }

      return response;
    } catch (error) {
      console.error('Error in getTopUsers:', error);
      throw new Error('Error fetching top users');
    }  
  }

  async getTopTransactions(username: string) {
    try {
      const currency = await this.currencyService.findAll();

      const balance = await this.transactionRepo.getUserBalanceByUsername(username);
      let response = [];
      for (const curr of currency) {
        const topTransactions = await this.transactionRepo.getTopTransaction(username,curr.name);
        if(topTransactions){
          response.push({
            currency: curr.name,
            top_transactions: topTransactions,
          });
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error in getTopUsers:', error);
      throw new Error('Error fetching top users');
    }  
  }

  // findAll() {
  //   return `This action returns all transactions`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} transaction`;
  // }

  // update(id: number, updateTransactionDto: UpdateTransactionDto) {
  //   return `This action updates a #${id} transaction`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} transaction`;
  // }
}