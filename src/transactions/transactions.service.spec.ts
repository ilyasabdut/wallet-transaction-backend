import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { CurrenciesService } from '../masterdatas/currencies/currencies.service';
import { UsersService } from '../users/users.service';
import { TransactionRepository } from './transaction.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let currencyService: CurrenciesService;
  let userService: UsersService;
  let transactionRepo: TransactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: CurrenciesService,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: TransactionRepository,
          useValue: {
            findAll: jest.fn(),
            createTransaction: jest.fn(),
            isCurrencyMatch: jest.fn(),
            getUserBalanceByUsername: jest.fn(),
            getTopTransaction: jest.fn(),
            queryTopUsers: jest.fn(),
            getTransactionCurrencies: jest.fn,
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    currencyService = module.get<CurrenciesService>(CurrenciesService);
    userService = module.get<UsersService>(UsersService);
    transactionRepo = module.get<TransactionRepository>(TransactionRepository);
  });

  describe('create', () => {
    it('should create transactions successfully', async () => {
      const createTransactionDto: CreateTransactionDto = {
        username_from: 'user1',
        username_to: 'user2',
        currency_id: 1,
        amount: 100,
        type: 'debit',
        notes: 'Test transaction',
      };

      const mockCurrency = { id: 1, name: 'Bitcoin' };
      const mockUserFrom = { id: 1, username: 'user1' };
      const mockUserTo = { id: 2, username: 'user2' };
      const mockDebitTransaction = { id: 1 };
      const mockCreditTransaction = { id: 2 };

      (currencyService.findOne as jest.Mock).mockResolvedValue(mockCurrency);
      (userService.findOne as jest.Mock).mockResolvedValueOnce(mockUserFrom).mockResolvedValueOnce(mockUserTo);
      (transactionRepo.createTransaction as jest.Mock).mockResolvedValueOnce(mockDebitTransaction).mockResolvedValueOnce(mockCreditTransaction);

      const result = await service.create(createTransactionDto);

      expect(result).toEqual({ debitTransaction: mockDebitTransaction, creditTransaction: mockCreditTransaction });
      expect(currencyService.findOne).toHaveBeenCalledWith(createTransactionDto.currency_id);
      expect(userService.findOne).toHaveBeenCalledWith(createTransactionDto.username_from);
      expect(userService.findOne).toHaveBeenCalledWith(createTransactionDto.username_to);
      expect(transactionRepo.createTransaction).toHaveBeenCalledTimes(2);
    });

  });

  describe('topup', () => {
    it('should top up balance successfully', async () => {
      const createTransactionDto: CreateTransactionDto = {
        username_to: 'user2',
        currency_id: 1,
        amount: 100,
        type: 'credit',
        notes: 'Test topup',
        username_from: ''
      };

      const mockUser = { id: 1, username: 'user2' };
      const mockTopupTransaction = { id: 1 };

      (userService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (transactionRepo.createTransaction as jest.Mock).mockResolvedValue(mockTopupTransaction);

      const result = await service.topup(createTransactionDto);

      expect(result).toEqual(mockTopupTransaction);
      expect(userService.findOne).toHaveBeenCalledWith(createTransactionDto.username_to);
      expect(transactionRepo.createTransaction).toHaveBeenCalled();
    });

  });

  describe('getBalance', () => {
    it('should get user balance successfully', async () => {
      const username = 'user1';
      const mockUser = { id: 1, username: 'user1' };
      const mockBalance = [{ currency_name: 'Bitcoin', total_amount: 100 }];

      (userService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (transactionRepo.getUserBalanceByUsername as jest.Mock).mockResolvedValue(mockBalance);

      const result = await service.getBalance(username);

      expect(result).toEqual([{ currency: 'Bitcoin', balance: 100 }]);
      expect(userService.findOne).toHaveBeenCalledWith(username);
      expect(transactionRepo.getUserBalanceByUsername).toHaveBeenCalledWith(username);
    });

  });

  describe('getTopUsers', () => {
    it('should get top users for each currency', async () => {
      const mockCurrencies = [{ name: 'Bitcoin' }, { name: 'Ethereum' }];
      const mockTopUsersBitcoin = [{ id: 1, username: 'user1' }];
      const mockTopUsersEthereum = [{ id: 2, username: 'user2' }];
      jest.spyOn(service, 'transactionCurrencies').mockResolvedValue(mockCurrencies);
      (transactionRepo.queryTopUsers as jest.Mock)
        .mockResolvedValueOnce(mockTopUsersBitcoin)
        .mockResolvedValueOnce(mockTopUsersEthereum);

      const result = await service.getTopUsers();

      expect(result).toEqual([
        { currency: 'Bitcoin', top_users: mockTopUsersBitcoin },
        { currency: 'Ethereum', top_users: mockTopUsersEthereum },
      ]);
      expect(service.transactionCurrencies).toHaveBeenCalled();
      expect(transactionRepo.queryTopUsers).toHaveBeenCalledTimes(2);
    });

  });

  describe('getTopTransactions', () => {
    it('should get top transactions for each currency', async () => {
      const username = 'user1';
      const mockCurrencies = [{ name: 'Bitcoin' }, { name: 'Ethereum' }];
      const mockTopTransactionsBitcoin = [{ id: 1, amount: 100 }];
      const mockTopTransactionsEthereum = [{ id: 2, amount: 200 }];

      jest.spyOn(service, 'transactionCurrencies').mockResolvedValue(mockCurrencies);
      (transactionRepo.getTopTransaction as jest.Mock)
        .mockResolvedValueOnce(mockTopTransactionsBitcoin)
        .mockResolvedValueOnce(mockTopTransactionsEthereum);

      const result = await service.getTopTransactions(username);

      expect(result).toEqual([
        { currency: 'Bitcoin', top_transactions: mockTopTransactionsBitcoin },
        { currency: 'Ethereum', top_transactions: mockTopTransactionsEthereum },
      ]);
      expect(service.transactionCurrencies).toHaveBeenCalled();
      expect(transactionRepo.getTopTransaction).toHaveBeenCalledTimes(2);
      expect(transactionRepo.getTopTransaction).toHaveBeenCalledWith(username, 'Bitcoin');
      expect(transactionRepo.getTopTransaction).toHaveBeenCalledWith(username, 'Ethereum');
    });

  });

  describe('findAll', () => {
    it('should find all transactions successfully', async () => {
      const username = 'user1';
      const page = 1;
      const pageSize = 10;
      const search = 'test';
      const mockTransactions = [{ id: 1, amount: 100 }];

      (transactionRepo.findAll as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await service.findAll(username, page, pageSize, search);

      expect(result).toEqual(mockTransactions);
      expect(transactionRepo.findAll).toHaveBeenCalledWith(username, page, pageSize, search);
    });

  });
});