import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
    @ApiProperty({ required: true })
    username: string;

    @ApiProperty({ required: true })
    password: string;
}
