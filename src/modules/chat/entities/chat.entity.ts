// src/modules/chats/entities/chat.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
  } from 'typeorm';
  import { Thread } from './thread.entity';
  
  @Entity()
  export class Chat {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column('text')
    question: string;
  
    @Column('text')
    answer: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @ManyToOne(() => Thread, (thread) => thread.chats)
    thread: Thread;
  }
  