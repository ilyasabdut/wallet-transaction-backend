// balance-helper.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BalanceItem {
  currency_name: string;
  total_amount: number;
}

export interface RankUsersItem {
  rank: number;
  username: string;
  currency_name: string;
  total_debit: number;
}

//TODO export this from another helper file
function serializeBigInt(obj: any): any {
  if (typeof obj === 'bigint') {
    return obj.toString(); // Convert BigInt to string
  } else if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInt(item));
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)])
    );
  } else {
    return obj;
  }
}

export async function getUserBalanceByUsername(username: string): Promise<BalanceItem[]> {
  try {
    const balance = await prisma.$queryRaw<BalanceItem[]>`
      SELECT
        usr.id,
        usr.username,
        cur.name AS currency_name,
        SUM(CASE WHEN tx.type = 'credit' THEN tx.amount ELSE 0 END) AS total_credit,
        SUM(CASE WHEN tx.type = 'debit' THEN tx.amount ELSE 0 END) AS total_debit,
        SUM(tx.amount) AS total_amount
      FROM
        "User" AS usr
        LEFT JOIN "Transaction" AS tx ON tx.user_id = usr.id
        LEFT JOIN "Currency" AS cur ON cur.id = tx.currency_id
      WHERE
        usr.username = ${username}
      GROUP BY
        usr.id,
        usr.username,
        cur.name
    `
    
    return balance
  } catch (error) {
    console.error('Error fetching user balance:', error);
    throw error;
  }
}

export async function isCurrencyMatch(username: string, expectedCurrencyName: string): Promise<boolean> {
  try {
    const userBalance = await getUserBalanceByUsername(username);
    console.log('User balance:', userBalance);
    // Check if the currency name matches the expected currency name
    if (Array.isArray(userBalance)) {
      const matchedBalance = userBalance.find(balance => balance.currency_name === expectedCurrencyName);
      
      if (matchedBalance) {
        // Assuming the total amount is what you want to check
        if (matchedBalance.total_amount <= 0) {
          throw new Error(`balance is 0 ${expectedCurrencyName} for user ${username}`);
        }
        return  true
      }

      throw new Error(`Currency ${expectedCurrencyName} is not available for user ${username}`);

    }

    return false;
  } catch (error) {
    console.error('Error checking currency name:', error);
    throw error;
  }
}

export async function queryTopUsers(currencyName: string){
  try {
    const rawTopUsers = await prisma.$queryRaw`
      SELECT
        ROW_NUMBER() OVER (
          ORDER BY ABS(SUM(
            CASE WHEN tx.type = 'debit' THEN tx.amount ELSE 0 END
          )) DESC
        ) AS rank,
        usr.username,
        cur.name AS currency_name,
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
    console.log('Raw Top users:', rawTopUsers);

    const serializedTopUsers = serializeBigInt(rawTopUsers);
    return serializedTopUsers;
  } catch (error) {
    console.error('Error fetching top users:', error);
    throw new Error('Error fetching top users');
  }
}

export async function getTopTransaction(username: string, currencyName: string) {
  try {
    const debitTransaction = await queryTopTransactionsDebit(username,currencyName);
    const creditTransaction = await queryTopTransactionsCredit(username,currencyName);

    return {
      debit: debitTransaction,
      credit: creditTransaction
    }

  }catch (error) {
    console.error('Error fetching top transactions:', error);
    throw new Error('Error fetching top transactions');
  }
}

async function queryTopTransactionsDebit(username: string,currencyName: string){
  try {
    const rawTopTransactionsDebit = await prisma.$queryRaw`
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
    console.log('Raw Top Transactions Debit:', rawTopTransactionsDebit);

    const serializedTopUsers = serializeBigInt(rawTopTransactionsDebit);
    return serializedTopUsers;
  } catch (error) {
    console.error('Error fetching Top Transactions Debit:', error);
    throw new Error('Error fetching Top Transactions Debit');
  }
}

async function queryTopTransactionsCredit(username: string,currencyName: string){
  try {
    const rawTopTransactionsCredit = await prisma.$queryRaw`
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
    console.log('Raw Top Transactions Credit:', rawTopTransactionsCredit);

    const serializedTopUsers = serializeBigInt(rawTopTransactionsCredit);
    return serializedTopUsers;
  } catch (error) {
    console.error('Error fetching Top Transactions Credit:', error);
    throw new Error('Error fetching Top Transactions Credit');
  }
}

