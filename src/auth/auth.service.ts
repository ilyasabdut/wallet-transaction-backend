import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const withPassword = true;
    const user = await this.usersService.findOne(username, withPassword);

    if (!user) {
      throw new UnauthorizedException('Username not found', {
        cause: new Error(),
        description: 'Username not found',
      });
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Username and password mismatch', {
        cause: new Error(),
        description: 'Username and password mismatch',
      });
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.roles[0].role.name,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
