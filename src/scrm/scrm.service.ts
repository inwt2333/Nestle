import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service'; // 假设已存在
import { AiService } from '../ai/ai.service'; // 假设已封装好调用大模型的 Service
import dayjs from 'dayjs';

@Injectable()
export class ScrmService {
  private readonly logger = new Logger(ScrmService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * 每天凌晨 2 点执行：扫描满 6 个月（约180天）的宝宝，为店员生成【换段位】关怀任务
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async generateDailyCareTasks() {
    this.logger.log('开始执行定时任务：扫描宝宝档案并生成专属营销话术...');

    // 1. 计算目标出生日期范围（例如：今天满 180 天的宝宝）
    const targetDate = dayjs().subtract(180, 'day').startOf('day').toDate();
    const targetDateEnd = dayjs().subtract(180, 'day').endOf('day').toDate();

    // 2. 查出今天刚好满 6 个月的宝宝及其对应的消费者信息
    const babyProfiles = await this.prisma.babyProfile.findMany({
      where: {
        birthDate: {
          gte: targetDate,
          lte: targetDateEnd,
        },
      },
      include: {
        customer: {
          include: {
            orders: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { store: { include: { employees: true } } },
            },
          },
        },
      },
    });

    if (!babyProfiles.length) {
      this.logger.log('今日无符合触发规则的宝宝档案。');
      return;
    }

    let taskCount = 0;

    // 3. 遍历生成营销待办任务
    for (const baby of babyProfiles) {
      const customer = baby.customer;
      if (!customer) continue;

      // 找到最近服务的店员（这里简化为取最新订单所在门店的首个店员）
      const lastOrder = customer.orders?.[0];
      const targetEmployee = lastOrder?.store?.employees?.[0];
      if (!targetEmployee) continue;

      // 4. 调用大模型 (LLM) 生成个性化沟通话术
      // 携带标签信息：宝宝名字、月龄(6个月)、过敏史等
      const aiPrompt = `
        你是一个专业的母婴营养顾问。
        顾客昵称: ${customer.nickname || '宝妈'}
        宝宝过敏史: ${baby.allergyInfo || '无'}
        触发场景: 宝宝马上满6个月，需要从1段配方奶粉升至2段。
        活动: 目前雀巢超启能恩2段有“买赠积分与环保空罐回收大促”。
        要求: 语气亲切，不能生硬推销。控制在 50 字以内，带上适合直接复制到微信发给顾客的格式。
      `;

      try {
        const generatedSpeech = await this.aiService.generateText(aiPrompt);

        // 在控制台高亮打印 AI 大模型的返回结果
        this.logger.log(`\n\n======================================================`);
        this.logger.log(`🤖 正在为店员 [${targetEmployee.name}] 生成针对顾客 [${customer.nickname}] 的话术...`);
        this.logger.log(`💬 大模型生成结果如下：\n\n${generatedSpeech}`);
        this.logger.log(`======================================================\n`);

        // 5. 持久化到“店员任务表” (以便店员在小程序中看到)
        await this.prisma.employeeTask.create({
          data: {
            employeeId: targetEmployee.id,
            customerId: customer.id,
            taskType: 'CARE_AND_SALES',
            title: `【换段提醒】${baby.name || '宝宝'}满6个月`,
            suggestedSpeech: generatedSpeech,
            couponId: 'COUPON_NESTLE_STAGE2',
            status: 'PENDING',
          }
        });
        
        taskCount++;
        this.logger.debug(`成功为店员 ${targetEmployee.name} 生成触达顾客 ${customer.nickname} 的任务`);

      } catch (error) {
        this.logger.error(`生成 AI 话术失败, BabyID: ${baby.id}`, error);
      }
    }

    this.logger.log(`定时任务执行完毕！共生成 ${taskCount} 个店员关怀任务。`);
  }
}
