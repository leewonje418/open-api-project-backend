// test/app.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module'; // 실제 AppModule 경로
import * as request from 'supertest';

describe('AI Chatbot E2E Test (All APIs)', () => {
  let app: INestApplication;
  let server: any;

  // 토큰 보관
  let userToken: string;    // 일반 유저 토큰
  let adminToken: string;   // 관리자(admin) 토큰
  // 특정 chatId, threadId, feedbackId 등을 저장하여 다음 테스트에서 활용 가능
  let createdThreadId: string;
  let createdChatId: string;
  let createdFeedbackId: string;

  beforeAll(async () => {
    // Nest Test Module 생성
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // 앱 초기화
    app = moduleFixture.createNestApplication();
    await app.init();

    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  // =======================
  // 1) 회원가입/로그인
  // =======================

  it('[POST /auth/signup] 일반 유저 회원가입', async () => {
    const res = await request(server)
      .post('/auth/signup')
      .send({
        email: 'testuser@example.com',
        password: 'test1234',
        name: 'TestUser',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('testuser@example.com');
  });

  it('[POST /auth/signup] 관리자 유저 회원가입 (role: admin)', async () => {
    const res = await request(server)
      .post('/auth/signup')
      .send({
        email: 'adminuser@example.com',
        password: 'admin1234',
        name: 'AdminUser',
        // 실제론 관리자 권한을 어떻게 부여하는지(로직, service) 따라 다를 수 있음
        // 여기서는 usersService.create()시 role을 강제로 admin으로 주는 방식을 쓴다고 가정
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('adminuser@example.com');
    // 주의: 실제 role 부여 로직에 따라 달라질 수 있음
  });

  it('[POST /auth/login] 일반 유저 로그인 -> userToken 획득', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'test1234',
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    userToken = res.body.token;
  });

  it('[POST /auth/login] 관리자 유저 로그인 -> adminToken 획득', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({
        email: 'adminuser@example.com',
        password: 'admin1234',
      })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    adminToken = res.body.token;
  });

  // =======================
  // 2) Chat API 테스트
  // =======================
  it('[POST /chat] 새 질문 생성(일반 유저)', async () => {
    const res = await request(server)
      .post('/chat')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        question: 'NestJS란 무엇인가요?',
        isStreaming: false,
        model: 'gpt-3.5-turbo',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('thread');
    expect(res.body.question).toBe('NestJS란 무엇인가요?');
    expect(typeof res.body.answer).toBe('string');

    createdChatId = res.body.id;           // 생성된 chat.id
    createdThreadId = res.body.thread.id;  // chat.thread.id
  });

  it('[GET /chat] 대화 목록 조회 (일반 유저)', async () => {
    const res = await request(server)
      .get('/chat')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ page: 1, limit: 10, order: 'DESC' })
      .expect(200);

    // { total, page, limit, data: [ { threadId, user, createdAt, chats: [] } ] }
    expect(res.body).toHaveProperty('data');
    const { data } = res.body;
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      // 첫 번째 스레드 정보
      expect(data[0]).toHaveProperty('threadId');
      expect(Array.isArray(data[0].chats)).toBe(true);
    }
  });

  // =======================
  // 3) Feedback API 테스트
  // =======================
  it('[POST /feedback/:chatId] 대화에 대한 피드백 생성 (일반 유저)', async () => {
    // createdChatId에 피드백 생성
    const res = await request(server)
      .post(`/feedback/${createdChatId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        isPositive: true,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('chat');
    expect(res.body).toHaveProperty('user');
    expect(res.body.isPositive).toBe(true);
    createdFeedbackId = res.body.id;
  });

  it('[GET /feedback] 피드백 목록 조회 (일반 유저)', async () => {
    const res = await request(server)
      .get('/feedback')
      .set('Authorization', `Bearer ${userToken}`)
      .query({ isPositive: 'true' })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    // 첫 번째 피드백 확인
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('chat');
      expect(res.body[0]).toHaveProperty('user');
    }
  });

  // =======================
  // 4) User(관리자 권한 필요), Feedback Update, Analytics(관리자 권한)
  // =======================
  it('[GET /user] 모든 유저 조회 (관리자만 가능)', async () => {
    const res = await request(server)
      .get('/user')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    // 관리자, 일반유저가 포함되어 있을 수 있음
  });

  it('[PATCH /feedback/:feedbackId/status] 피드백 상태 변경 (관리자)', async () => {
    const res = await request(server)
      .patch(`/feedback/${createdFeedbackId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'resolved' })
      .expect(200);

    expect(res.body).toHaveProperty('id', createdFeedbackId);
    expect(res.body).toHaveProperty('status', 'resolved');
  });

  it('[GET /analytics/daily-activity] 24시간 회원가입/로그인/대화 생성 통계 (관리자)', async () => {
    const res = await request(server)
      .get('/analytics/daily-activity')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('signupCount');
    expect(res.body).toHaveProperty('loginCount');
    expect(res.body).toHaveProperty('chatCount');
  });

  it('[POST /analytics/generate-report] 24시간 CSV 보고서 생성 (관리자)', async () => {
    const res = await request(server)
      .post('/analytics/generate-report')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201)  // 보고서 생성 시 상태코드가 201 or 200 중 하나일 수 있음

    // { fileName, message: 'CSV 보고서 생성 완료' }
    expect(res.body).toHaveProperty('fileName');
    expect(res.body).toHaveProperty('message');
  });

  // =======================
  // 5) 스레드 삭제 (일반 유저)
  // =======================
  it('[DELETE /chat/:threadId] 특정 스레드 삭제 (일반 유저)', async () => {
    // createdThreadId를 일반유저가 삭제
    const res = await request(server)
      .delete(`/chat/${createdThreadId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);

    // delete()의 반환 형식이 { affected: number } 혹은 null
    // 여기서는 affected=1일 수도
    expect(res.body).toHaveProperty('affected');
  });
});
