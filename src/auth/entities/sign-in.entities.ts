import { ApiProperty } from '@nestjs/swagger';

export class SignInEntity {
  @ApiProperty()
  access_token: string;
}
