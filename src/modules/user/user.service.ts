// src/modules/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SignupDto } from '../auth/dto/signup.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(signupDto: SignupDto) {
    const user = this.userRepository.create(signupDto);
    return this.userRepository.save(user);
  }

  // 예시로 관리자용 전체 유저 조회
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByEmailOrId(userIdOrEmail: string) {
    // userId가 uuid 형태인지 간단히 체크, 아니면 email로 간주
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(userIdOrEmail);
    if (isUuid) {
      return this.userRepository.findOne({ where: { id: userIdOrEmail } });
    } else {
      return this.findByEmail(userIdOrEmail);
    }
  }
}

