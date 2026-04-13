import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AiService } from './ai/ai.service';
import { PrismaService } from './prisma/prisma.service';
import { ScrmService } from './scrm/scrm.service';
import { AppController } from './app.controller';
import { TaskController } from './task.controller';
import { BusinessController } from './business.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(), // 启用定时任务支持
  ],
  controllers: [AppController, TaskController, BusinessController],
  providers: [AiService, PrismaService, ScrmService],
})
export class AppModule {}
