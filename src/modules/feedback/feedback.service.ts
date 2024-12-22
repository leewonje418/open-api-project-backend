// src/modules/feedback/feedback.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { Chat } from '../chat/entities/chat.entity';
import { UserService } from '../user/user.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Role } from '../../shared/enums/role.enum';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback) private readonly feedbackRepo: Repository<Feedback>,
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    private readonly userService: UserService,
  ) {}

  async createFeedback(userId: string, chatId: string, dto: CreateFeedbackDto) {
    const user = await this.userService.findById(userId);
    if (!user) throw new ForbiddenException('Invalid user');

    const chat = await this.chatRepo.findOne({ where: { id: chatId }, relations: ['thread'] });
    if (!chat) throw new NotFoundException('해당 대화를 찾을 수 없습니다.');

    // 관리자 아니면, 본인이 생성한 chat인지 확인
    if (user.role !== Role.ADMIN) {
      if (chat.thread.user.id !== user.id) {
        throw new ForbiddenException('본인이 생성한 대화에만 피드백 가능');
      }
    }

    // 이미 피드백 등록했는지 확인
    const existing = await this.feedbackRepo.findOne({
      where: { user: { id: user.id }, chat: { id: chat.id } },
    });
    if (existing) {
      throw new ForbiddenException('이미 피드백을 등록했습니다.');
    }

    const feedback = this.feedbackRepo.create({
      user,
      chat,
      isPositive: dto.isPositive,
      status: 'pending',
    });
    return this.feedbackRepo.save(feedback);
  }

  async findAllFeedbacks(requestUser, isPositive?: boolean) {
    const where: any = {};
    if (requestUser.role !== Role.ADMIN) {
      where.user = { id: requestUser.userId };
    }
    if (isPositive !== undefined) {
      where.isPositive = isPositive;
    }
    return this.feedbackRepo.find({
      where,
      relations: ['user', 'chat'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(requestUser, feedbackId: string, status: string) {
    if (requestUser.role !== Role.ADMIN) {
      throw new ForbiddenException('관리자만 상태 변경 가능');
    }
    const feedback = await this.feedbackRepo.findOne({ where: { id: feedbackId } });
    if (!feedback) throw new NotFoundException('피드백이 존재하지 않음');

    feedback.status = status; // pending/resolved
    return this.feedbackRepo.save(feedback);
  }
}
