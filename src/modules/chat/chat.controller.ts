// src/modules/chats/chats.controller.ts
import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    Delete,
    Param,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiOkResponse,
  } from '@nestjs/swagger';
  import { CreateChatDto } from './dto/create-chat.dto';
  import { QueryChatDto } from './dto/query-chat.dto';
  import { RolesGuard } from '../../shared/guards/roles.guard';
  import { Request } from 'express';
  import { ChatService } from './chat.service';
  
  @ApiTags('Chat')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Controller('chat')
  export class ChatController {
    constructor(private readonly chatService: ChatService) {}
  
    @Post()
    @ApiOperation({ summary: '새로운 대화 생성 (질문/답변)' })
    async createChat(@Req() req: Request, @Body() dto: CreateChatDto) {
      // req.user는 JWT 검증 후 주입된다고 가정
      const userId = (req as any).user.userId;
      return this.chatService.createChat(userId, dto);
    }
  
    @Get()
    @ApiOperation({ summary: '대화(스레드) 전체 조회 (내것 or 관리자 전체)' })
    async findAll(@Req() req: Request, @Query() query: QueryChatDto) {
      const user = (req as any).user;
      return this.chatService.findAllChats(user, query);
    }
  
    @Delete(':threadId')
    @ApiOperation({ summary: '특정 스레드 삭제' })
    async deleteThread(@Req() req: Request, @Param('threadId') threadId: string) {
      const user = (req as any).user;
      return this.chatService.deleteThread(user, threadId);
    }
  }
  
  