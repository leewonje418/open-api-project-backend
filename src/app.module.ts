// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { User } from './modules/user/entities/user.entity';
import { Chat } from './modules/chat/entities/chat.entity';
import { Thread } from './modules/chat/entities/thread.entity';
import { Feedback } from './modules/feedback/entities/feedback.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Postgres 연결 (.env에서 불러옴)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'nest_chatbot',
      entities: [User, Chat, Thread, Feedback],
      synchronize: true, // 개발 편의용 (실서버는 migration 권장)
    }),
    AuthModule,
    UserModule,
    ChatModule,
    FeedbackModule,
    AnalyticsModule,
  ],
})
export class AppModule {}

