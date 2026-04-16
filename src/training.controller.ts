import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('articles')
  async getArticles() {
    let articles = await this.prisma.knowledgeArticle.findMany();
    // 注入初始数据（如果为空）
    if (articles.length === 0) {
      await this.prisma.knowledgeArticle.createMany({
        data: [
          {
            title: '超启能恩3段核心卖点与适用人群',
            category: 'PRODUCT',
            content: '核心卖点：1. 适度水解工艺，降低致敏性。2. 含有活性益生菌Bb-12。 适用人群：家族有轻度过敏史的宝宝，消化吸收较弱的宝宝。常见答疑：Q：味道微苦正常吗？A：由于水解工艺，微苦是正常现象。',
            videoUrl: 'https://video.example.com/product-chaoqi.mp4'
          },
          {
            title: '6-12个月宝宝辅食添加要点',
            category: 'PARENTING',
            content: '六个月起应循序渐进添加富含铁的泥糊状食物。观察宝宝吞咽情况，由少到多、由稀到稠、由细到粗。每添加一种新食物需观察过敏反应3-5天。',
            videoUrl: 'https://video.example.com/parenting-fushi.mp4'
          }
        ]
      });
      articles = await this.prisma.knowledgeArticle.findMany();
    }
    return { success: true, data: articles };
  }

  @Get('assessments')
  async getAssessments() {
    const list = await this.prisma.assessment.findMany({
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: list };
  }

  @Post('assess')
  async createAssessment(@Body() data: { 
    employeeId: string; 
    period: string; 
    knowledgeScore: number; 
    ownerReviewScore: number; 
    customerReviewScore: number; 
  }) {
    // 综合评价计算：知识40% 店长30% 客情30%
    const finalScore = 
      Number(data.knowledgeScore) * 0.4 + 
      Number(data.ownerReviewScore) * 0.3 + 
      Number(data.customerReviewScore) * 0.3;
    
    let result = '';
    if (finalScore >= 90) result = '优秀：奖励现金800元，年终评优优先';
    else if (finalScore >= 75) result = '良好：基础奖励300元';
    else if (finalScore >= 60) result = '合格：无奖罚';
    else result = '不合格：扣除当月绩效，重新进行基础培训';

    const test = await this.prisma.assessment.create({
      data: {
        employeeId: data.employeeId,
        period: data.period,
        knowledgeScore: Number(data.knowledgeScore),
        ownerReviewScore: Number(data.ownerReviewScore),
        customerReviewScore: Number(data.customerReviewScore),
        finalScore: Number(finalScore.toFixed(2)),
        result
      }
    });
    return { success: true, data: test, message: '测评生成成功' };
  }

  @Get('employees')
  async getEmployees() {
    let emps = await this.prisma.employee.findMany();
    if (emps.length === 0) {
      const store = await this.prisma.store.findFirst();
      if(store) {
        await this.prisma.employee.create({
          data: {
            storeId: store.id,
            name: '仔细听',
            phone: '13811112222',
            role: 'MANAGER'
          }
        });
        emps = await this.prisma.employee.findMany();
      }
    }
    return { success: true, data: emps };
  }
}
