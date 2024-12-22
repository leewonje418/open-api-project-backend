import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Thread } from './entities/thread.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { QueryChatDto, Order } from './dto/query-chat.dto';
import { UserService } from '../user/user.service';
import { OpenaiService, ChatMessage } from '../chat/openai.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,

    @InjectRepository(Thread)
    private readonly threadRepo: Repository<Thread>,

    private readonly usersService: UserService,
    private readonly openaiService: OpenaiService,
  ) {}

  /**
   * 새 질문(대화) 생성
   * - dto.isStreaming 이 true면 stream 형태로 응답
   */
  async createChat(userId: string, dto: CreateChatDto) {
    // 1) 유저 확인
    const user = await this.usersService.findById(userId);
    if (!user) throw new ForbiddenException('Invalid user');

    // 2) 스레드 찾기/생성 (30분 규칙)
    const thread = await this.findOrCreateThread(user.id);

    // 3) 기존 대화 -> messages
    const messages: ChatMessage[] = thread.chats?.map((c) => ({
      role: 'user',
      content: c.question,
    })) || [];

    // 새 질문
    messages.push({
      role: 'user',
      content: dto.question,
    });

    // 4) OpenAI 호출
    let answer: string;
    const model = dto.model || 'gpt-3.5-turbo';

    if (dto.isStreaming) {
      // 스트리밍 호출
      answer = await this.openaiService.createChatStreaming(messages, model);
    } else {
      // 비스트리밍
      answer = await this.openaiService.createChatNonStreaming(messages, model);
    }

    // 5) DB 저장
    const chat = this.chatRepo.create({
      question: dto.question,
      answer,
      thread,
    });
    return this.chatRepo.save(chat);
  }

  /**
   * 대화(스레드) 목록 조회
   * - 관리자 or 본인 스레드
   */
  async findAllChats(requestUser: any, query: QueryChatDto) {
    const { page = 1, limit = 10, order = Order.DESC } = query;
    const skip = (page - 1) * limit;

    let whereOption = {};
    if (requestUser.role !== 'admin') {
      whereOption = { user: { id: requestUser.userId } };
    }

    const [threads, total] = await this.threadRepo.findAndCount({
      where: whereOption,
      relations: ['chats', 'user'],
      order: { createdAt: order },
      skip,
      take: limit,
    });

    const data = threads.map((t) => {
      const sortedChats = t.chats.sort((a, b) =>
        order === Order.ASC
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime(),
      );
      return {
        threadId: t.id,
        user: t.user.email,
        createdAt: t.createdAt,
        chats: sortedChats,
      };
    });

    return { total, page, limit, data };
  }

  /**
   * 스레드 삭제
   */
  async deleteThread(requestUser: any, threadId: string) {
    const thread = await this.threadRepo.findOne({
      where: { id: threadId },
      relations: ['user'],
    });
    if (!thread) throw new ForbiddenException('스레드가 존재하지 않습니다.');

    if (requestUser.role !== 'admin' && thread.user.id !== requestUser.userId) {
      throw new ForbiddenException('삭제 권한이 없습니다.');
    }

    return this.threadRepo.delete(threadId);
  }

  /**
   * 30분 내 마지막 대화면 기존 Thread, 아니면 새 Thread
   */
  private async findOrCreateThread(userId: string): Promise<Thread> {
    const lastThread = await this.threadRepo.findOne({
      where: { user: { id: userId } },
      relations: ['chats'],
      order: { createdAt: 'DESC' },
    });

    const now = new Date();
    if (lastThread && lastThread.chats?.length) {
      const lastChat = lastThread.chats.reduce((prev, curr) =>
        curr.createdAt > prev.createdAt ? curr : prev,
      );
      const diffMin = (now.getTime() - lastChat.createdAt.getTime()) / 60000;
      if (diffMin <= 30) {
        return lastThread;
      }
    }

    const newThread = this.threadRepo.create({ user: { id: userId } as any });
    return this.threadRepo.save(newThread);
  }
}


