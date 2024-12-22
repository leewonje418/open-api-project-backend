// src/modules/analytics/analytics.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Chat } from '../chat/entities/chat.entity';
import { Thread } from '../chat/entities/thread.entity';
import * as dayjs from 'dayjs';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../../shared/enums/role.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(Thread) private readonly threadRepo: Repository<Thread>,
  ) {}

  async getDailyActivity(requestUser) {
    if (requestUser.role !== Role.ADMIN) {
      throw new ForbiddenException('관리자만 접근 가능합니다.');
    }
    const now = new Date();
    const yesterday = dayjs(now).subtract(1, 'day').toDate();

    // 회원가입 수
    const signupCount = await this.userRepo.count({ where: { createdAt: Between(yesterday, now) } });
    // 로그인 로그가 따로 없으므로 0
    const loginCount = 0;
    // 대화 생성 수
    const chatCount = await this.chatRepo.count({ where: { createdAt: Between(yesterday, now) } });

    return { signupCount, loginCount, chatCount };
  }

  async generateCsvReport(requestUser) {
    if (requestUser.role !== Role.ADMIN) {
      throw new ForbiddenException('관리자만 접근 가능합니다.');
    }
    const now = new Date();
    const yesterday = dayjs(now).subtract(1, 'day').toDate();

    // 24시간 이내의 chat
    const chats = await this.chatRepo.find({
      where: { createdAt: Between(yesterday, now) },
      relations: ['thread', 'thread.user'],
    });

    // CSV
    let csv = 'chatId,question,answer,userEmail,createdAt\n';
    chats.forEach((c) => {
      const row = [
        c.id,
        `"${c.question.replace(/"/g, '""')}"`,
        `"${c.answer.replace(/"/g, '""')}"`,
        c.thread.user.email,
        c.createdAt.toISOString(),
      ];
      csv += row.join(',') + '\n';
    });

    const fileName = `report-${uuidv4()}.csv`;
    fs.writeFileSync(fileName, csv, 'utf8');
    return { fileName, message: 'CSV 보고서 생성 완료' };
  }
}
