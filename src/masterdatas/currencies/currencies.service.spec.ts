import { Test, TestingModule } from '@nestjs/testing';
import { CurrenciesService } from './currencies.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CurrenciesService', () => {
  let service: CurrenciesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    // Mock PrismaService
    const prismaMock = {
      currency: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrenciesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CurrenciesService>(CurrenciesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of currencies', async () => {
      const result = [
        {
          id: 1,
          name: 'Bitcoin',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
        {
          id: 2,
          name: 'Ethereum',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
      ];
      jest.spyOn(prisma.currency, 'findMany').mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single currency by id', async () => {
      const result = {
        id: 1,
        name: 'Bitcoin',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
      jest.spyOn(prisma.currency, 'findUnique').mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
    });

    it('should return null if currency is not found', async () => {
      jest.spyOn(prisma.currency, 'findUnique').mockResolvedValue(null);

      expect(await service.findOne(999)).toBeNull();
    });
  });
});
