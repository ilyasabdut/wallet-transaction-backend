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
      wallet_address: 'wallet123',
      wallet_balance: 0.5,
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
      wallet_address: 'wallet456',
      wallet_balance: 1.2,
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
  const currencyBTC = await prisma.currency.create({
    data: {
      name: 'Bitcoin',
    },
  });

  const currencyETH = await prisma.currency.create({
    data: {
      name: 'Ethereum',
    },
  });

  // Create Transactions
  await prisma.transaction.create({
    data: {
      user: {
        connect: { id: user1.id },
      },
      currency: {
        connect: { id: currencyBTC.id },
      },
      amount: 0.5,
      type: 'deposit',
      wallet_address_from: 'external_wallet_1',
      wallet_address_to: 'wallet123',
      notes: 'Deposit from external wallet to john_doe\'s wallet',
    },
  });

  await prisma.transaction.create({
    data: {
      user: {
        connect: { id: user2.id },
      },
      currency: {
        connect: { id: currencyETH.id },
      },
      amount: 1.2,
      type: 'transfer',
      wallet_address_from: 'wallet456',
      wallet_address_to: 'wallet123',
      notes: 'Transfer from jane_doe to john_doe',
    },
  });
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