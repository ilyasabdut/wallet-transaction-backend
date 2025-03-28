import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { SignInEntity } from './entities/sign-in.entities';
import { Response } from 'express';
import { SkipAuth } from '../helper/helper';

@Controller('auth')
@ApiTags('Auth')
@SkipAuth()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: SignInEntity })
  @ApiBadRequestResponse({ description: 'Invalid credentials or other error' })
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    try {
      const access_token = await this.authService.signIn(
        signInDto.username.toLowerCase(),
        signInDto.password,
      );
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Login Successful',
        data: access_token,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}
