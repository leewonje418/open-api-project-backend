// src/modules/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Chat } from '../chat/entities/chat.entity';
import { Thread } from '../chat/entities/thread.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chat, Thread])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}