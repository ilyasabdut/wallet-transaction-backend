import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // throw new Error('Ops, theres a problem!');
    return 'Hello World!, Welcome to Wallet Tranction API';
  }
}
