import { PrismaService } from '../../src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { serializeBigInt } from '../helper/helper';

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
  constructor(private prisma: PrismaService) {}

  async createTransaction(data: {
    user_id: number;
    from_user_id: number;
    to_user_id: number;
    currency_id: number;
    amount: number;
    type: 'debit' | 'credit';
    notes: string;
    created_at?: Date;
    updated_at?: Date;
  }) {
    return await this.prisma.transaction.create({
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
          ROUND(SUM(CASE WHEN tx.type = 'credit' THEN tx.amount ELSE 0 END)::numeric, 2) AS total_credit,
          ROUND(SUM(CASE WHEN tx.type = 'debit' THEN tx.amount ELSE 0 END)::numeric, 2) AS total_debit,
          ROUND(COALESCE(SUM(tx.amount), 0)::numeric, 2) AS total_amount
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

  async isCurrencyMatch(
    username: string,
    expectedCurrencyName: string,
    amount: number,
  ): Promise<boolean> {
    try {
      const userBalance = await this.getUserBalanceByUsername(username);

      if (Array.isArray(userBalance)) {
        const matchedBalance = userBalance.find(
          (balance) => balance.currency_name === expectedCurrencyName,
        );

        if (matchedBalance) {
          if (matchedBalance.total_amount - amount <= 0) {
            throw new Error(`You do not have enough ${expectedCurrencyName}`);
          }
          return true;
        }

        throw new Error(`You do not have ${expectedCurrencyName}`);
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
          ABS(SUM(CASE WHEN tx.type = 'debit' THEN tx.amount ELSE 0 END)) AS total_debit
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

  async getTopTransaction(
    username: string,
    currencyName: string,
  ): Promise<{ debit: RankUsersItem; credit: RankUsersItem }> {
    try {
      const debitTransaction = await this.queryTopTransactionsDebit(
        username,
        currencyName,
      );
      const creditTransaction = await this.queryTopTransactionsCredit(
        username,
        currencyName,
      );
      // Check if both transactions are null or undefined
      if (debitTransaction == null && creditTransaction == null) {
        return null; // Return an empty object if both are null or undefined
      }

      return {
        debit: debitTransaction ?? null,
        credit: creditTransaction ?? null,
      };
    } catch (error) {
      console.error('Error fetching top transactions:', error);
      throw new Error('Error fetching top transactions');
    }
  }

  async queryTopTransactionsDebit(
    username: string,
    currencyName: string,
  ): Promise<RankUsersItem> {
    try {
      const rawTopTransactionsDebit = await this.prisma.$queryRaw<
        RankUsersItem[]
      >`
        SELECT
          ROW_NUMBER() OVER (
            ORDER BY SUM(
              CASE WHEN tx.type = 'debit' THEN tx.amount ELSE 0 END
            ) DESC
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

  async queryTopTransactionsCredit(
    username: string,
    currencyName: string,
  ): Promise<RankUsersItem> {
    try {
      const rawTopTransactionsCredit = await this.prisma.$queryRaw<
        RankUsersItem[]
      >`
        SELECT
          ROW_NUMBER() OVER (
            ORDER BY SUM(
              CASE WHEN tx.type = 'credit' THEN tx.amount ELSE 0 END
            ) DESC
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

  async findAll(
    username: string,
    page: number,
    pageSize: number,
    search: string,
  ) {
    try {
      const getUser = await this.prisma.user.findUnique({
        where: {
          username: username,
        },
      });

      const skip = (page - 1) * pageSize;

      const transactions = await this.prisma.transaction.findMany({
        skip: skip,
        take: Number(pageSize),
        where: {
          user_id: getUser.id,
          ...(search &&
            search.trim() && {
              OR: [
                { id: parseInt(search, 10) || -1 }, // Safeguard against NaN, will not match if search is not a number
                {
                  currency: { name: { contains: search, mode: 'insensitive' } },
                },
                { type: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } },
                {
                  transactionFromUserId: {
                    username: { contains: search, mode: 'insensitive' },
                  },
                },
                {
                  transactionToUserId: {
                    username: { contains: search, mode: 'insensitive' },
                  },
                },
              ],
            }),
        },
        include: {
          currency: true,
          transactionFromUserId: {
            select: {
              username: true,
            },
          },
          transactionToUserId: {
            select: {
              username: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      const transformedTransactions = transactions.map((tx) => ({
        tx_id: tx.id,
        currency_name: tx.currency.name,
        type: tx.type,
        amount: tx.amount,
        from_username: tx.transactionFromUserId?.username || 'DEPOSIT',
        to_username: tx.transactionToUserId.username,
        notes: tx.notes,
      }));

      return transformedTransactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Error fetching transactions');
    }
  }

  async getTransactionCurrencies(userId: number | null = null) {
    const transactions = await this.prisma.transaction.findMany({
      distinct: ['currency_id'],
      where: userId ? { user_id: userId } : {},
      include: {
        currency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return transactions.map((transaction) => ({
      name: transaction.currency.name,
    }));
  }
}
