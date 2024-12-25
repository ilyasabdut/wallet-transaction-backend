// import * as Sentry from '@sentry/node';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { Response } from 'express';
import { SkipAuth } from '../helper/helper';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //TODO move into auth?
  @SkipAuth()
  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const user = await this.usersService.create(createUserDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      // Sentry.captureException(error);
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Get()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async findAll(@Res() res: Response) {
    try {
      const users = await this.usersService.findAll();
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'Users found successfully',
        data: users,
      });
    } catch (error) {
      // Sentry.captureException(error);
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Get(':username')
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async findOne(@Param('username') username: string, @Res() res: Response) {
    try {
      const user = await this.usersService.findOne(username);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'User found successfully',
        data: user,
      });
    } catch (error) {
      // Sentry.captureException(error);
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.usersService.update(+id, updateUserDto);
      return res.status(HttpStatus.CREATED).json({
        statusCode: HttpStatus.CREATED,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      // Sentry.captureException(error);
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await this.usersService.remove(+id);
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: 'User deleted successfully',
        data: user,
      });
    } catch (error) {
      // Sentry.captureException(error);
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}
