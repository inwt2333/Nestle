import { Controller, Get, Put, Param } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('tasks')
export class TaskController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getPendingTasks() {
    // 模拟 B端店员登录态：假设当前调用者是“仔细听”
    const employee = await this.prisma.employee.findFirst({
      where: { name: '仔细听' },
    });

    if (!employee) return [];

    const tasks = await this.prisma.employeeTask.findMany({
      where: {
        employeeId: employee.id,
        status: 'PENDING',
      },
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 组装给前端 Vue 的数据结构
    return tasks.map(t => ({
      id: t.id,
      title: t.title,
      customerName: t.customer.nickname,
      suggestedSpeech: t.suggestedSpeech,
      couponId: t.couponId,
    }));
  }

  @Put(':id/complete')
  async completeTask(@Param('id') id: string) {
    return this.prisma.employeeTask.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }

  @Put(':id/ignore')
  async ignoreTask(@Param('id') id: string) {
    // 设置状态为 IGNORED，下次不显示给店员
    return this.prisma.employeeTask.update({
      where: { id },
      data: { status: 'IGNORED' },
    });
  }
}
