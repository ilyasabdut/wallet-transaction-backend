import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // throw new BadRequestException('400!');
    return 'Hello World!, Welcome to Wallet Tranction API';
  }
}
 