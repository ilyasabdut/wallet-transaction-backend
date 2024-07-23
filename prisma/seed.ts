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
      name: 'Admin',  // Using a string for the role name
    },
  });

  const roleUser = await prisma.role.create({
    data: {
      name: 'User',  // Using a string for the role name
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
  const currencyUSD = await prisma.currency.create({
    data: {
      name: 'USD',
    },
  });


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
      user_id: user1.id,
      currency_id: currencyBTC.id,
      amount: 0.5,
      type: 'Credit',
      from_user_id: null,
      to_user_id: user1.id,
      notes: 'Deposit from external wallet to john_doe\'s wallet',
    },
  });

  await prisma.transaction.create({
    data: {
      user_id: user2.id,
      currency_id: currencyETH.id,
      amount: -1.2,
      type: 'Debit',
      from_user_id: user2.id,
      to_user_id: user1.id,
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