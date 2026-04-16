import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service'; 
import { AiService } from '../ai/ai.service'; 
import dayjs from 'dayjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ScrmService {
  private readonly logger = new Logger(ScrmService.name);
  private knowledgeBaseContent = '';

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {
    try {
      const kbPath = path.join(__dirname, '..', 'ai', 'knowledge.md');
      this.knowledgeBaseContent = fs.readFileSync(kbPath, 'utf8');
      this.logger.log('已成功加载雀巢产品知识库 (Knowledge Base)');
    } catch (e) {
      this.logger.warn('未找到产品知识库文件 /src/ai/knowledge.md', String(e));
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async generateDailyCareTasks() {
    this.logger.log('开始执行定时任务：扫描宝宝档案并依据知识库生成营销话术...');

    const babyProfiles = await this.prisma.babyProfile.findMany({
      include: {
        customer: {
          include: {
            orders: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { store: { include: { employees: true } } },
            },
            employeeTasks: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
        },
      },
    });

    if (!babyProfiles.length) {
      this.logger.log('系统内暂无宝宝档案。');
      return;
    }

    let taskCount = 0;
    const defaultEmployee = await this.prisma.employee.findFirst();

    for (const baby of babyProfiles) {
      const customer = baby.customer;
      if (!customer) continue;

      const pendingTask = customer.employeeTasks?.find(t => t.status === 'PENDING');
      if (pendingTask) {
        this.logger.debug(`顾客 ${customer.nickname} 尚有未处理完的关怀任务，本次跳过`);
        continue;
      }

      let targetEmployee = customer.orders?.[0]?.store?.employees?.[0];
      if (!targetEmployee) {
         targetEmployee = defaultEmployee as any; 
      }
      if (!targetEmployee) continue;

      const ageInDays = dayjs().diff(dayjs(baby.birthDate), 'day');
      const ageInMonths = Math.floor(ageInDays / 30.4);

      let taskTitle = `【日常关怀】宝宝${ageInMonths}个大`;
      
      // 构建核心提示词 (包含知识库)
      let aiPrompt = `【系统指令】你是一个专业的雀巢母婴及营养顾问。必须根据提供的《产品知识库》内容来回答和推荐合适的产品。不要编造产品。
【产品知识库】: 
${this.knowledgeBaseContent}

【当前顾客画像】: 
名字昵称: ${customer.nickname || '宝妈'}
宝宝月龄: 大约${ageInMonths}个月大，具体天数约${ageInDays}天。
宝宝过敏史: ${baby.allergyInfo || '无'}
`;

      if (ageInDays >= 170 && ageInDays <= 190) {
        taskTitle = `【换段提醒】宝宝快6个月了，精准推荐`;
        aiPrompt += `\n【触发场景】: 顾客的宝宝即将满6个月。在6个月转段和尝试辅食的关键节点。并且店里有换空罐活动。\n【你的任务】: 从《产品知识库》中为她推荐适合目前宝宝过敏状态的"雀巢2段奶粉"或"嘉宝辅食"和"回收计划"。`;
      } else if (ageInMonths === 12) {
        taskTitle = `【生日关怀】1周岁营养规划`;
        aiPrompt += `\n【触发场景】: 顾客的宝宝马上1岁生日了。\n【你的任务】: 温馨祝福宝宝生日，并从知识库中挑选1岁之后(3段)的合适产品进行关怀。`;
      } else {
        aiPrompt += `\n【你的任务】: 请结合知识库中符合当前宝宝月龄和体质(尤其是过敏史)的产品，给出一段温馨的关怀提醒。`;
      }

      aiPrompt += `\n【要求】: 语气像真实的热情店员"仔细听"，亲切自然，不要生硬。回复的文案控制在 60 字以内，带上适合微信发送的表情符号 Emoji。`;

      try {
        const generatedSpeech = await this.aiService.generateText(aiPrompt);

        this.logger.log(`\n\n======================================================`);
        this.logger.log(`🤖 \x1b[36m检索知识库中...\x1b[0m 正在为顾客 [${customer.nickname}] 思考...`);
        this.logger.log(`💬 大模型生成结果如下：\n\n${generatedSpeech}`);
        this.logger.log(`======================================================\n`);

        await this.prisma.employeeTask.create({
          data: {
            employeeId: targetEmployee.id,
            customerId: customer.id,
            taskType: 'CARE_AND_SALES',
            title: taskTitle,
            suggestedSpeech: generatedSpeech,
            couponId: 'COUPON_NESTLE_GENERAL',
            status: 'PENDING',
          }
        });
        
        taskCount++;

      } catch (error) {
        this.logger.error(`生成 AI 话术失败, BabyID: ${baby.id}`, error);
      }
    }

    this.logger.log(`定时任务执行完毕！基于知识库共生成 ${taskCount} 个干货型店员任务。`);
  }
}
