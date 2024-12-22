// src/modules/feedback/feedback.controller.ts
import { Controller, Post, Body, Param, Get, Query, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Request } from 'express';
import { RolesGuard } from '../../shared/guards/roles.guard';

@ApiTags('Feedback')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post(':chatId')
  @ApiOperation({ summary: '특정 대화에 대한 피드백 생성' })
  async createFeedback(@Req() req: Request, @Param('chatId') chatId: string, @Body() dto: CreateFeedbackDto) {
    const userId = (req as any).user.userId;
    return this.feedbackService.createFeedback(userId, chatId, dto);
  }

  @Get()
  @ApiOperation({ summary: '피드백 목록 조회 (본인 또는 관리자 전체)' })
  async getFeedbacks(@Req() req: Request, @Query('isPositive') isPositive: string) {
    const user = (req as any).user;
    let flag: boolean;
    if (isPositive === 'true') flag = true;
    if (isPositive === 'false') flag = false;
    return this.feedbackService.findAllFeedbacks(user, flag);
  }

  @Patch(':feedbackId/status')
  @ApiOperation({ summary: '피드백 상태 변경 (관리자만)' })
  async updateStatus(@Req() req: Request, @Param('feedbackId') feedbackId: string, @Body() body: { status: string }) {
    const user = (req as any).user;
    return this.feedbackService.updateStatus(user, feedbackId, body.status);
  }
}
