# Wallet Transaction Backend

This project provides a backend for a simple wallet application using NestJS, Prisma, and PostgreSQL. It includes functionalities for user management, transactions, and more.

## Features

- Register new users
- Read wallet balance
- Deposit and transfer balance between wallets
- List top N transactions by value per user
- List overall top transacting users by value

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL
- Prisma CLI


### Architecture

The backend is built using NestJS, a popular Node.js framework. Prisma is used as an ORM to interact with the database. PostgreSQL is the chosen database for this project. For Authentication, this project using JWT which included in NestJS framework.

### Database Schema
Created using dbdiagram.io

![alt text](image.png)

### Logger
Using sentry.io as logger

### Deployment

- Backend is deployed on Render.
   A bit disclaimer, when logged in for the first time, users may have seen a bit of lag because if i quote from Render, it says "Your free instance will spin down with inactivity, which can delay requests by 50 seconds or more."
- Database is deployed on Neon.

This repo uses Github Action as CI/CD. main.yaml could be found in .github/workflows/main.yaml

### Testing

Unit Test using Jest
   
   npm test --coverage


### Setup

1. **Clone the Repository**

   ```
   git clone https://github.com/yourusername/wallet-transaction-backend.git
   cd wallet-transaction-backend
   ```

2. **Install Dependencies**

   ```
   npm install
   ```

3. **Create a `.env` File**
   ```
   APP_ENV="local"
   DATABASE_URL="postgresql://username:password@localhost:5432/yourdatabase"
   SECRET_KEY="yoursecretkey"
   ```
4. **Run Prisma Migrations**
   ```
   npx prisma migrate dev --name init
   ```

5. **Seed the Database**
   ```
   npm run seed
   ```

6. **Start the Application**
   ```
   npm run start
   ```
   The application will start and be available at [http://localhost:3000](http://localhost:3000)


### Future Improvements

- Input validation using class-validators
- Store JWT in cookies
- API verify JWT
- Refresh Token
- Use Transaction Prisma for Create, Update and Delete APIs
- Use ConfigOptions for ENV