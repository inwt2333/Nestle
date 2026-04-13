import { Controller, Get } from '@nestjs/common';
import { ScrmService } from './scrm/scrm.service';

@Controller()
export class AppController {
  constructor(private readonly scrmService: ScrmService) {}

  @Get()
  getHello(): string {
    return '欢迎访问雀巢 bC 一体化母婴数字化平台 API 服务！';
  }

  @Get('trigger-scrm')
  async triggerScrm(): Promise<string> {
    await this.scrmService.generateDailyCareTasks();
    return '已成功触发 SCRM AI 话术自动化生成任务，请在服务端控制台查看执行结果。';
  }
}
