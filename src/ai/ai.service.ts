import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  /**
   * 调用真实大模型接口 (如 Gemini / OpenAI API)
   * @param prompt 提示词
   * @returns 生成的回复
   */
  async generateText(prompt: string): Promise<string> {
    this.logger.debug(`调用真实 LLM，处理 Prompt...`);
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'sk-your-openai-or-gemini-api-key-here') {
      this.logger.warn('未检测到有效的 OPENAI_API_KEY，使用备用降级返回。');
      return `【系统降级】亲爱的顾客，您的宝宝马上满6个月啦，现在转2段超启能恩有买赠活动哦！`;
    }

    try {
      const baseUrl = process.env.OPENAI_API_BASE_URL || 'https://yeysai.com/v1';
      const modelName = process.env.AI_MODEL || 'gemini-3.1-flash-lite-preview';

      // 兼容 OpenAI 格式的 Gemini API 调用
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model: modelName,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 100,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      
      return response.data.choices[0].message.content.trim();
    } catch (error: any) {
      this.logger.error('大模型接口调用失败', error.message);
      return '生成建议话术失败，请店长手动跟进！';
    }
  }
}
