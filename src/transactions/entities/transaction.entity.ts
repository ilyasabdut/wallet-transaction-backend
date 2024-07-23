import { ApiProperty } from '@nestjs/swagger';
import { Transaction } from '@prisma/client';

export class TransactionEntity implements Transaction {
    @ApiProperty()
    id: number;

    @ApiProperty()
    user_id: number;

    @ApiProperty()
    from_user_id: number | null;

    @ApiProperty()
    to_user_id: number | null;

    @ApiProperty()
    currency_id: number;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    type: string;

    @ApiProperty()
    notes: string | null;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;

    @ApiProperty()
    deleted_at: Date | null;
}
