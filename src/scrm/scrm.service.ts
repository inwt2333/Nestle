import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service'; 
import { AiService } from '../ai/ai.service'; 
import dayjs from 'dayjs';

@Injectable()
export class ScrmService {
  private readonly logger = new Logger(ScrmService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async generateDailyCareTasks() {
    this.logger.log('开始执行定时任务：扫描宝宝档案并生成专属营销话术...');

    // 1. 查找所有宝宝
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
    
    // 如果没有门店或员工，无法分配任务，我们获取第一个员工备用
    const defaultEmployee = await this.prisma.employee.findFirst();

    for (const baby of babyProfiles) {
      const customer = baby.customer;
      if (!customer) continue;

      // 规则1：检查7天内是否给这个顾客发过任务（包括已发送或待处理的）
      const pendingTask = customer.employeeTasks?.find(t => t.status === 'PENDING');
      if (pendingTask) {
        this.logger.debug(`顾客 ${customer.nickname} 尚有未处理完的关怀任务，本次跳过`);
        continue;
      }

      let targetEmployee = customer.orders?.[0]?.store?.employees?.[0];
      if (!targetEmployee) {
         targetEmployee = defaultEmployee as any; // 兜底：分配给店里第一个员工
      }
      if (!targetEmployee) continue;

      // 算算宝宝现在几个月了
      const ageInDays = dayjs().diff(dayjs(baby.birthDate), 'day');
      const ageInMonths = Math.floor(ageInDays / 30.4);

      let taskTitle = `【日常关怀】宝宝${ageInMonths}个月大`;
      let aiPrompt = `你是一个专业的母婴营养顾问。顾客昵称: ${customer.nickname || '宝妈'}。宝宝过敏史: ${baby.allergyInfo || '无'}。`;

      // 简单阶段划分（可按需补充）
      if (ageInDays >= 170 && ageInDays <= 190) {
        taskTitle = `【换段提醒】宝宝快6个月了`;
        aiPrompt += `宝宝目前接近6个月，正处于添加辅食和由1段转为2段配方奶粉的关键期。当前有“雀巢超启能恩2段买赠和空罐回收活动”。`;
      } else if (ageInMonths === 12) {
        taskTitle = `【生日关怀】宝宝1周岁啦`;
        aiPrompt += `宝宝马上满1周岁了。祝福宝宝生日，并且推荐店内适合1岁宝宝的小零食或3段奶粉。`;
      } else {
        aiPrompt += `宝宝目前大约${ageInMonths}个月大。请根据这个月龄，给出一段50字以内温馨的关怀或者育儿小科普。不用强行推销。`;
      }

      aiPrompt += ` 要求: 语气亲切，不能生硬。控制在 50 字以内，带上适合直接复制到微信发给顾客的格式。`;

      try {
        const generatedSpeech = await this.aiService.generateText(aiPrompt);

        this.logger.log(`\n\n======================================================`);
        this.logger.log(`🤖 正在为店员 [${targetEmployee.name}] 生成针对顾客 [${customer.nickname}] 的话术...`);
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

    this.logger.log(`定时任务执行完毕！共生成 ${taskCount} 个店员关怀任务。`);
  }
}
