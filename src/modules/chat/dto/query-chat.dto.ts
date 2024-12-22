// src/modules/chats/dto/query-chat.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min, IsPositive } from 'class-validator';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryChatDto {
  @ApiPropertyOptional({ enum: Order })
  @IsOptional()
  @IsEnum(Order)
  order?: Order = Order.DESC;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsPositive()
  @IsInt()
  limit?: number = 10;
}
