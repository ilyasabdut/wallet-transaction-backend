// src/auth/auth.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('should return a JWT token if credentials are valid', async () => {
      const username = 'testUser';
      const password = 'testPass';
      const user = {
        id: 1,
        username,
        password: await bcrypt.hash(password, 10),
        roles: [{ role: { name: 'user' } }],
      };

      (usersService.findOne as jest.Mock).mockResolvedValue(user);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('testToken');

      const result = await authService.signIn(username, password);

      expect(result).toEqual({ access_token: 'testToken' });
      expect(usersService.findOne).toHaveBeenCalledWith(username, true);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        username: user.username,
        role: 'user',
      });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const username = 'testUser';
      const password = 'wrongPass';

      const user = {
        id: 1,
        username,
        password: await bcrypt.hash('testPass', 10),
        roles: [{ role: { name: 'user' } }],
      };

      (usersService.findOne as jest.Mock).mockResolvedValue(user);

      await expect(authService.signIn(username, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const username = 'testUser';
      const password = 'testPass';

      (usersService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(authService.signIn(username, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
