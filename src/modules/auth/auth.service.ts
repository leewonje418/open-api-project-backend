// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.userService.findByEmail(signupDto.email);
    if (existingUser) {
      throw new UnauthorizedException('이미 가입된 이메일입니다.');
    }
    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = await this.userService.create({
      ...signupDto,
      password: hashedPassword,
    });
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 패스워드가 올바르지 않습니다.');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('이메일 또는 패스워드가 올바르지 않습니다.');
    }

    const payload = { userId: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    return { token };
  }
}

