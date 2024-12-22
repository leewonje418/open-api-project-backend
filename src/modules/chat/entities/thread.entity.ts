// src/modules/chats/entities/thread.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { User } from '../../user/entities/user.entity';
import { Chat } from './chat.entity';
  
  @Entity()
  export class Thread {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User)
    user: User;
  
    @OneToMany(() => Chat, (chat) => chat.thread)
    chats: Chat[];
  
    @CreateDateColumn()
    createdAt: Date;
  }
  