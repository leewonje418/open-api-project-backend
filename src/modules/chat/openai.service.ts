import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

/**
 * 메시지의 role은 'system' | 'user' | 'assistant' 중 하나 (간소화)
 */
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

@Injectable()
export class OpenaiService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * 비스트리밍 - 한 번에 결과 받기
   */
  async createChatNonStreaming(messages: ChatMessage[], model = 'gpt-3.5-turbo') {
    const body = {
      model,
      messages,
      stream: false as const,
    };
    const res = await this.openai.chat.completions.create(body);
    return res.choices[0]?.message?.content || '';
  }

  /**
   * 스트리밍 - chunk 단위 데이터
   * 실제 SSE 전송 로직은 Controller에서 진행하는 것이 일반적.
   * 여기서는 Promise<string> 형태로 간소화해서 모든 chunk를 이어붙여 반환하는 예시.
   */
  async createChatStreaming(messages: ChatMessage[], model = 'gpt-3.5-turbo'): Promise<string> {
    const body = {
      model,
      messages,
      stream: true as const,
    };

    // 스트리밍 응답(ReadableStream)
    const response = await this.openai.chat.completions.create(body);

    // 여기서는 모든 chunk를 이어붙여 최종 문자열을 만들고 리턴 (학습용 간소화)
    let finalText = '';
    for await (const chunk of response) {
      const textDelta = chunk.choices[0]?.delta?.content || '';
      finalText += textDelta;
    }
    return finalText;
  }
}




