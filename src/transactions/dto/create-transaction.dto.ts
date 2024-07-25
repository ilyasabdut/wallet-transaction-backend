import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ required: false })
  username_from: string;

  @ApiProperty({ required: true })
  username_to: string;

  @ApiProperty({ required: true })
  currency_id: number;

  @ApiProperty({ required: true, default: 0 })
  amount: number;

  @ApiProperty({ enum: ['credit', 'debit'] })
  type: string;

  @ApiProperty({ required: false })
  notes: string;
}
