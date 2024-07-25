import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn().mockResolvedValue('fake-access-token'),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signIn', () => {
    it('should return an access token on successful login', async () => {
      const signInDto: SignInDto = { username: 'test', password: 'password' };
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await authController.signIn(signInDto, res as Response);

      
      expect(authService.signIn).toHaveBeenCalledWith(
        signInDto.username,
        signInDto.password,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'Login Successful',
        data: 'fake-access-token',
      });
    });

    it('should return an error on login failure', async () => {
      const signInDto: SignInDto = {
        username: 'test',
        password: 'wrong-password',
      };
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      jest
        .spyOn(authService, 'signIn')
        .mockRejectedValueOnce(new Error('Invalid credentials'));

      await authController.signIn(signInDto, res as Response);

      expect(authService.signIn).toHaveBeenCalledWith(
        signInDto.username,
        signInDto.password,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'Invalid credentials',
      });
    });
  });
});
