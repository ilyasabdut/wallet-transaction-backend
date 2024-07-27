import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  // Mock response function
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
        role: 'User',
      };

      const createdUser = {
        id: 1,
        username: createUserDto.username,
        password: createUserDto.password,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        roles: [{ role: { name: createUserDto.role } }],
      };

      jest.spyOn(service, 'create').mockResolvedValue(createdUser);

      const res = mockResponse();
      await controller.create(createUserDto, res);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: createdUser,
      });
    });

    it('should handle errors and capture with Sentry', async () => {
      const createUserDto: CreateUserDto = {
        username: 'faultyuser',
        password: 'wrongpassword',
        role: 'User',
      };

      const error = new Error('Something went wrong');

      // Mock the service method to throw an error
      jest.spyOn(service, 'create').mockRejectedValue(error);

      const res = mockResponse();
      await controller.create(createUserDto, res);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    });
  });
});
