// src/modules/feedback/dto/create-feedback.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsBoolean()
  isPositive: boolean;
}
