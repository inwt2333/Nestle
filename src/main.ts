import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ScrmService } from './scrm/scrm.service';
import * as dotenv from 'dotenv';

dotenv.config(); // 确保加载 .env 文件中的配置

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 开启 CORS 以便于 Vue 开发服务器跨域请求
  app.enableCors();
  // 为了测试，我们可以在这里直接调用一次定时任务的方法
  const scrmService = app.get(ScrmService);
  console.log('🚀 服务启动中...');
  
  // 模拟触发一次 AI 任务生成
  await scrmService.generateDailyCareTasks();

  await app.listen(3000);
  console.log('🚀 雀巢 bC 数字化平台后端已启动，监听在 http://localhost:3000');
}
bootstrap();
