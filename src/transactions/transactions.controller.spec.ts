import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FindAllTransaction } from './dto/find-all-transaction.dto';
import { HttpStatus } from '@nestjs/common';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: {
            create: jest.fn(),
            topup: jest.fn(),
            getBalance: jest.fn(),
            findAll: jest.fn(),
            getTopUsers: jest.fn(),
            getTopTransactions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction and return response', async () => {
      const createTransactionDto: CreateTransactionDto = {
        username_from: 'user1',
        username_to: 'user2',
        currency_id: 1,
        amount: 100,
        type: 'debit',
        notes: 'Test transaction',
      };

      const mockTransaction = { id: 1, ...createTransactionDto };
      (service.create as jest.Mock).mockResolvedValue(mockTransaction);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.create(createTransactionDto, res as any);

      expect(service.create).toHaveBeenCalledWith(createTransactionDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CREATED,
        message: 'Transaction created successfully',
        data: mockTransaction,
      });
    });

    it('should handle error and return BAD_REQUEST status', async () => {
      const createTransactionDto: CreateTransactionDto = {
        username_from: 'user1',
        username_to: 'user2',
        currency_id: 1,
        amount: 100,
        type: 'debit',
        notes: 'Test transaction',
      };

      (service.create as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.create(createTransactionDto, res as any);

      expect(service.create).toHaveBeenCalledWith(createTransactionDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error',
      });
    });
  });

  describe('topup', () => {
    it('should top up balance and return response', async () => {
      const createTransactionDto: CreateTransactionDto = {
        username_to: 'user2',
        currency_id: 1,
        amount: 100,
        type: 'credit',
        notes: 'Test topup',
        username_from: '',
      };

      const mockTransaction = { id: 1, ...createTransactionDto };
      (service.topup as jest.Mock).mockResolvedValue(mockTransaction);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.topup(createTransactionDto, res as any);

      expect(service.topup).toHaveBeenCalledWith(createTransactionDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CREATED,
        message: 'Top Up successful',
        data: mockTransaction,
      });
    });

    it('should handle error and return BAD_REQUEST status', async () => {
      const createTransactionDto: CreateTransactionDto = {
        username_to: 'user2',
        currency_id: 1,
        amount: 100,
        type: 'credit',
        notes: 'Test topup',
        username_from: '',
      };

      (service.topup as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.topup(createTransactionDto, res as any);

      expect(service.topup).toHaveBeenCalledWith(createTransactionDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error',
      });
    });
  });

  describe('getBalance', () => {
    it('should get balance and return response', async () => {
      const username = 'user1';
      const mockBalance = [{ currency: 'Bitcoin', balance: 100 }];
      (service.getBalance as jest.Mock).mockResolvedValue(mockBalance);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getBalance(username, res as any);

      expect(service.getBalance).toHaveBeenCalledWith(username);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        message: 'Balance found successfully',
        data: mockBalance,
      });
    });

    it('should handle error and return BAD_REQUEST status', async () => {
      const username = 'user1';
      (service.getBalance as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getBalance(username, res as any);

      expect(service.getBalance).toHaveBeenCalledWith(username);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error',
      });
    });
  });

  describe('GetListTransaction', () => {
    it('should get list of transactions and return response', async () => {
      const query: FindAllTransaction = {
        username: 'user1',
        page: 1,
        pageSize: 10,
        search: '',
      };
      const mockTransactions = [{ id: 1, amount: 100 }];
      (service.findAll as jest.Mock).mockResolvedValue(mockTransactions);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.GetListTransaction(query, res as any);

      expect(service.findAll).toHaveBeenCalledWith(
        query.username,
        query.page,
        query.pageSize,
        query.search,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        message: 'List transaction found successfully',
        data: mockTransactions,
      });
    });

    it('should handle error and return BAD_REQUEST status', async () => {
      const query: FindAllTransaction = {
        username: 'user1',
        page: 1,
        pageSize: 10,
        search: '',
      };
      (service.findAll as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.GetListTransaction(query, res as any);

      expect(service.findAll).toHaveBeenCalledWith(
        query.username,
        query.page,
        query.pageSize,
        query.search,
      );
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error',
      });
    });
  });

  describe('getTopUsers', () => {
    it('should get top users and return response', async () => {
      const mockTopUsers = [{ id: 1, username: 'user1' }];
      (service.getTopUsers as jest.Mock).mockResolvedValue(mockTopUsers);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getTopUsers(res as any);

      expect(service.getTopUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        message: 'topUsers found successfully',
        data: mockTopUsers,
      });
    });

    it('should handle error and return BAD_REQUEST status', async () => {
      (service.getTopUsers as jest.Mock).mockRejectedValue(new Error('Error'));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getTopUsers(res as any);

      expect(service.getTopUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error',
      });
    });
  });

  describe('getTopTransactions', () => {
    it('should get top transactions and return response', async () => {
      const username = 'user1';
      const mockTopTransactions = [{ id: 1, amount: 100 }];
      (service.getTopTransactions as jest.Mock).mockResolvedValue(
        mockTopTransactions,
      );
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getTopTransactions(username, res as any);

      expect(service.getTopTransactions).toHaveBeenCalledWith(username);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        message: 'topTransactions found successfully',
        data: mockTopTransactions,
      });
    });

    it('should handle error and return BAD_REQUEST status', async () => {
      const username = 'user1';
      (service.getTopTransactions as jest.Mock).mockRejectedValue(
        new Error('Error'),
      );

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getTopTransactions(username, res as any);

      expect(service.getTopTransactions).toHaveBeenCalledWith(username);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Error',
      });
    });
  });
});
