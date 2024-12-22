// file: src/modules/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// 별도 서비스 예시
import { UserModule } from '../user/user.module';
import { Chat } from './entities/chat.entity';
import { Thread } from './entities/thread.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { OpenaiService } from './openai.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Thread]), UserModule],
  controllers: [ChatController],
  providers: [ChatService, OpenaiService],
})
export class ChatModule {}
