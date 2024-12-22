// src/modules/users/entities/user.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  import { Role } from '../../../shared/enums/role.enum';
  
  @Entity()
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @Column()
    name: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @Column({
      type: 'enum',
      enum: Role,
      default: Role.MEMBER,
    })
    role: Role;
  }
  
  