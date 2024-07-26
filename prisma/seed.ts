import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash the passwords
  const password = 'password';
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create Roles
  const roleAdmin = await prisma.role.create({
    data: {
      name: 'Admin',
    },
  });

  const roleUser = await prisma.role.create({
    data: {
      name: 'User',
    },
  });

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      username: 'john_doe',
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
      roles: {
        create: {
          role: {
            connect: { id: roleAdmin.id },
          },
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'jane_doe',
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
      roles: {
        create: {
          role: {
            connect: { id: roleUser.id },
          },
        },
      },
    },
  });

  // Create Currency
  const currencies = [
    'Bitcoin',
    'Ethereum',
  ];

  const createdCurrencies = await Promise.all(currencies.map(name =>
    prisma.currency.create({
      data: { name },
    })
  ));

  // Create Transactions
  const transactions = [
    { user_id: user1.id, currency_id: createdCurrencies[0].id, amount: 0.5, type: 'credit', from_user_id: null, to_user_id: user1.id, notes: 'Deposit from external wallet to john_doe\'s wallet' },
    { user_id: user2.id, currency_id: createdCurrencies[1].id, amount: -1.2, type: 'debit', from_user_id: user2.id, to_user_id: user1.id, notes: 'Transfer from jane_doe to john_doe' },
    { user_id: user1.id, currency_id: createdCurrencies[0].id, amount: 2.5, type: 'credit', from_user_id: null, to_user_id: user1.id, notes: 'Deposit from external wallet to john_doe\'s wallet' },
    { user_id: user2.id, currency_id: createdCurrencies[1].id, amount: -3.0, type: 'debit', from_user_id: user2.id, to_user_id: user1.id, notes: 'Transfer from jane_doe to john_doe' },
    { user_id: user1.id, currency_id: createdCurrencies[1].id, amount: 1.0, type: 'credit', from_user_id: null, to_user_id: user1.id, notes: 'Deposit from external wallet to john_doe\'s wallet' },
    { user_id: user2.id, currency_id: createdCurrencies[0].id, amount: -0.7, type: 'debit', from_user_id: user2.id, to_user_id: user1.id, notes: 'Transfer from jane_doe to john_doe' },
    { user_id: user1.id, currency_id: createdCurrencies[0].id, amount: 0.8, type: 'credit', from_user_id: null, to_user_id: user1.id, notes: 'Deposit from external wallet to john_doe\'s wallet' },
    { user_id: user2.id, currency_id: createdCurrencies[1].id, amount: -1.5, type: 'debit', from_user_id: user2.id, to_user_id: user1.id, notes: 'Transfer from jane_doe to john_doe' },
    { user_id: user1.id, currency_id: createdCurrencies[0].id, amount: 2.0, type: 'credit', from_user_id: null, to_user_id: user1.id, notes: 'Deposit from external wallet to john_doe\'s wallet' },
    { user_id: user2.id, currency_id: createdCurrencies[1].id, amount: -1.8, type: 'debit', from_user_id: user2.id, to_user_id: user1.id, notes: 'Transfer from jane_doe to john_doe' },
  ];

  await Promise.all(transactions.map(transaction =>
    prisma.transaction.create({
      data: transaction,
    })
  ));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });