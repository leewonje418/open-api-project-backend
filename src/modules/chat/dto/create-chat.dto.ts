// src/modules/chats/dto/create-chat.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateChatDto {
  @ApiProperty()
  @IsString()
  question: string;

  @ApiProperty({ description: 'stream 응답 형태 사용 여부', required: false })
  @IsOptional()
  @IsBoolean()
  isStreaming?: boolean;

  @ApiProperty({ description: 'OpenAI 모델 지정 (옵션)', required: false })
  @IsOptional()
  @IsString()
  model?: string;
}
