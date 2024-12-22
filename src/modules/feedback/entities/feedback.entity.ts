// src/modules/feedback/entities/feedback.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Chat } from '../../chat/entities/chat.entity';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Chat)
  chat: Chat;

  @Column()
  isPositive: boolean;

  @Column({ default: 'pending' })
  status: string; // pending or resolved

  @CreateDateColumn()
  createdAt: Date;
}

  