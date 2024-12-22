// src/modules/analytics/analytics.controller.ts
import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Request } from 'express';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('daily-activity')
  @ApiOperation({ summary: '최근 24시간의 회원가입, 로그인, 대화 생성 수 (관리자만)' })
  async getDailyActivity(@Req() req: Request) {
    return this.analyticsService.getDailyActivity((req as any).user);
  }

  @Post('generate-report')
  @ApiOperation({ summary: '24시간 이내 대화 CSV 보고서 생성 (관리자만)' })
  async generateCsvReport(@Req() req: Request) {
    return this.analyticsService.generateCsvReport((req as any).user);
  }
}
