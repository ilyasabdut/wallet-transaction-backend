import { Test, TestingModule } from '@nestjs/testing';
import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('CurrenciesController', () => {
  let currenciesController: CurrenciesController;
  let currenciesService: CurrenciesService;
  let res: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrenciesController],
      providers: [
        {
          provide: CurrenciesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    currenciesController = module.get<CurrenciesController>(CurrenciesController);
    currenciesService = module.get<CurrenciesService>(CurrenciesService);

    // Mocking the response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
  });

  describe('findAll', () => {
    it('should return a list of currencies on success', async () => {
      const result = [
        { id: 1, name: 'USD', created_at: new Date(), updated_at: new Date(), deleted_at: null },
        { id: 2, name: 'EUR', created_at: new Date(), updated_at: new Date(), deleted_at: null },
      ];

      (currenciesService.findAll as jest.Mock).mockResolvedValue(result);

      await currenciesController.findAll(res);

      expect(currenciesService.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        message: 'Currency List found successfully',
        data: result,
      });
    });

    it('should handle errors gracefully', async () => {
      const errorMessage = 'Error fetching currencies';
      (currenciesService.findAll as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await currenciesController.findAll(res);

      expect(currenciesService.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    });
  });

  describe('findOne', () => {
    it('should return a currency by ID on success', async () => {
      const result = { id: 1, name: 'USD', created_at: new Date(), updated_at: new Date(), deleted_at: null };
      const id = 1;

      (currenciesService.findOne as jest.Mock).mockResolvedValue(result);

      await currenciesController.findOne(id, res);

      expect(currenciesService.findOne).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        message: 'Currency List found successfully',
        data: result,
      });
    });

    it('should handle errors gracefully when fetching a currency by ID', async () => {
      const errorMessage = 'Error fetching currency';
      const id = 1;
      (currenciesService.findOne as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await currenciesController.findOne(id, res);

      expect(currenciesService.findOne).toHaveBeenCalledWith(id);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    });
  });
});