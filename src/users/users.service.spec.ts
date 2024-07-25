import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

import { UserRepository } from './users.repository';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepo: Partial<UserRepository>;

  beforeEach(async () => {
    userRepo = {
      getUserByUsername: jest.fn(),
      getRoleByName: jest.fn(),
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: userRepo },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        username: 'newuser',
        password: 'password123',
        role: 'User',
      };

      // Mock implementations
      (userRepo.getUserByUsername as jest.Mock).mockResolvedValue(null); // No user exists
      (userRepo.getRoleByName as jest.Mock).mockResolvedValue({ id: 1 }); // Role exists
      (userRepo.createUser as jest.Mock).mockResolvedValue({
        id: 1,
        username: createUserDto.username,
        role: 1,
      });

      // Mock bcrypt.hash
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword123');

      const result = await usersService.create(createUserDto);

      expect(userRepo.getUserByUsername).toHaveBeenCalledWith(createUserDto.username);
      expect(userRepo.getRoleByName).toHaveBeenCalledWith(createUserDto.role);
      expect(userRepo.createUser).toHaveBeenCalledWith({
        username: createUserDto.username,
        password: 'hashedPassword123',
        role: 1,
      });
      expect(result).toEqual({
        id: 1,
        username: createUserDto.username,
        role: 1,
      });
    });

    it('should throw an error if the user already exists', async () => {
      const createUserDto = {
        username: 'existinguser',
        password: 'password123',
        role: 'User',
      };

      (userRepo.getUserByUsername as jest.Mock).mockResolvedValue({ id: 1 }); // User exists

      await expect(usersService.create(createUserDto)).rejects.toThrow('User already exists');
    });

    it('should throw an error if the role is not found', async () => {
      const createUserDto = {
        username: 'newuser',
        password: 'password123',
        role: 'NonExistentRole',
      };

      (userRepo.getUserByUsername as jest.Mock).mockResolvedValue(null); // No user exists
      (userRepo.getRoleByName as jest.Mock).mockResolvedValue(null); // Role does not exist

      await expect(usersService.create(createUserDto)).rejects.toThrow('Role not found');
    });
  });
});