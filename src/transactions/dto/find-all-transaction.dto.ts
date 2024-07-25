import { ApiProperty } from '@nestjs/swagger';

export class FindAllTransaction {
  @ApiProperty({ required: false })
  username?: string;

  @ApiProperty({ required: true, default: 1 })
  page: number;

  @ApiProperty({ required: true, default: 10 })
  pageSize: number;

  @ApiProperty({ required: false })
  search?: string;

}