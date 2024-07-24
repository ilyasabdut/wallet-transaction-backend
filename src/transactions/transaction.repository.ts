import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { serializeBigInt } from  'src/helper/helper';

interface BalanceItem {
  currency_name: string;
  total_amount: number;
}

interface RankUsersItem {
  rank: number;
  username: string;
  currency_name: string;
  total_debit: number;
}

@Injectable()
export class TransactionRepository {
  constructor(
    private prisma: PrismaService,
) {}
    
  async createTransaction(data: {
    user_id:number,
    from_user_id: number, 
    to_user_id:number,
    currency_id: number;
    amount: number;
    type: 'debit' | 'credit';
    notes: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    return this.prisma.transaction.create({
      data: {
        ...data,
        created_at: data.created_at || new Date(),
        updated_at: data.updated_at || new Date(),
      },
    });
  }

  async getUserBalanceByUsername(username: string): Promise<BalanceItem[]> {
    try {
      const balance = await this.prisma.$queryRaw<BalanceItem[]>`
        SELECT
          usr.id,
          usr.username,
          COALESCE(cur.name, 'EMPTY') AS currency_name,
          SUM(CASE WHEN tx.type = 'credit' THEN tx.amount ELSE 0 END) AS total_credit,
          SUM(CASE WHEN tx.type = 'debit' THEN tx.amount ELSE 0 END) AS total_debit,
          COALESCE(SUM(tx.amount), 0) AS total_amount
        FROM
          "User" AS usr
          LEFT JOIN "Transaction" AS tx ON tx.user_id = usr.id
          LEFT JOIN "Currency" AS cur ON cur.id = tx.currency_id
        WHERE
          usr.username = ${username}
        GROUP BY
          usr.id,
          usr.username,
          cur.name;
      `;
      return balance;
    } catch (error) {
      console.error('Error fetching user balance:', error);
      throw error;
    }
  }

  async isCurrencyMatch(username: string, expectedCurrencyName: string, amount: number): Promise<boolean> {
    try {
      const userBalance = await this.getUserBalanceByUsername(username);

      if (Array.isArray(userBalance)) {
        const matchedBalance = userBalance.find(balance => balance.currency_name === expectedCurrencyName);

        if (matchedBalance) {
          if (matchedBalance.total_amount - amount <= 0) {
            throw new Error(`Balance is insufficient for ${expectedCurrencyName} for user ${username}`);
          }
          return true;
        }

        throw new Error(`Currency ${expectedCurrencyName} is not available for user ${username}`);
      }

      return false;
    } catch (error) {
      console.error('Error checking currency name:', error);
      throw error;
    }
  }

  async queryTopUsers(currencyName: string): Promise<RankUsersItem[]> {
    try {
      const rawTopUsers = await this.prisma.$queryRaw<RankUsersItem[]>`
        SELECT
          ROW_NUMBER() OVER (
            ORDER BY ABS(SUM(
              CASE WHEN tx.type = 'debit' THEN tx.amount ELSE 0 END
            )) DESC
          ) AS rank,
          usr.username,
          COALESCE(cur.name, 'EMPTY') AS currency_name,
          ABS(SUM(
            CASE WHEN tx.type = 'debit' THEN tx.amount ELSE 0 END
          )) AS total_debit
        FROM
          "User" AS usr
          LEFT JOIN "Transaction" AS tx ON tx.user_id = usr.id
          JOIN "Currency" AS cur ON cur.id = tx.currency_id
        WHERE cur.name = ${currencyName}
        GROUP BY
          usr.id,
          usr.username,
          cur.name
        ORDER BY
          total_debit DESC
        LIMIT 10;
      `;
      return serializeBigInt(rawTopUsers);
    } catch (error) {
      console.error('Error fetching top users:', error);
      throw new Error('Error fetching top users');
    }
  }

  async getTopTransaction(username: string, currencyName: string): Promise<{ debit: RankUsersItem; credit: RankUsersItem }> {
    try {
      const debitTransaction = await this.queryTopTransactionsDebit(username, currencyName);
      const creditTransaction = await this.queryTopTransactionsCredit(username, currencyName);
      return {
        debit: debitTransaction ,
        credit: creditTransaction,
      };
    } catch (error) {
      console.error('Error fetching top transactions:', error);
      throw new Error('Error fetching top transactions');
    }
  }

  async queryTopTransactionsDebit(username: string, currencyName: string): Promise<RankUsersItem> {
    try {
      const rawTopTransactionsDebit = await this.prisma.$queryRaw<RankUsersItem[]>`
        SELECT
          ROW_NUMBER() OVER (
            ORDER BY ABS(SUM(
              CASE WHEN tx.type = 'debit' THEN tx.amount ELSE 0 END
            )) DESC
          ) AS rank,
          usr.username,
          cur.name AS currency_name,
          SUM(
            CASE WHEN tx.type = 'debit' THEN tx.amount ELSE 0 END
          ) AS total_debit
        FROM
          "User" AS usr
          LEFT JOIN "Transaction" AS tx ON tx.user_id = usr.id
          JOIN "Currency" AS cur ON cur.id = tx.currency_id
        WHERE cur.name = ${currencyName}
        AND usr.username = ${username}
        GROUP BY
          usr.id,
          usr.username,
          cur.name
        ORDER BY
          total_debit ASC
        LIMIT 10;
      `;
      const serializedTopUsers = serializeBigInt(rawTopTransactionsDebit);
      return serializedTopUsers[0];
    } catch (error) {
      console.error('Error fetching Top Transactions Debit:', error);
      throw new Error('Error fetching Top Transactions Debit');
    }
  }

  async queryTopTransactionsCredit(username: string, currencyName: string): Promise<RankUsersItem> {
    try {
      const rawTopTransactionsCredit = await this.prisma.$queryRaw<RankUsersItem[]>`
        SELECT
          ROW_NUMBER() OVER (
            ORDER BY ABS(SUM(
              CASE WHEN tx.type = 'credit' THEN tx.amount ELSE 0 END
            )) DESC
          ) AS rank,
          usr.username,
          cur.name AS currency_name,
          SUM(
            CASE WHEN tx.type = 'credit' THEN tx.amount ELSE 0 END
          ) AS total_credit
        FROM
          "User" AS usr
          LEFT JOIN "Transaction" AS tx ON tx.user_id = usr.id
          JOIN "Currency" AS cur ON cur.id = tx.currency_id
        WHERE cur.name = ${currencyName}
        AND usr.username = ${username}
        GROUP BY
          usr.id,
          usr.username,
          cur.name
        ORDER BY
          total_credit DESC
        LIMIT 10;
      `;
      const serializedTopUsers = serializeBigInt(rawTopTransactionsCredit);
      return serializedTopUsers[0];
    } catch (error) {
      console.error('Error fetching Top Transactions Credit:', error);
      throw new Error('Error fetching Top Transactions Credit');
    }
  }
}