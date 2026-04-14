import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AiService } from './ai/ai.service';
import { PrismaService } from './prisma/prisma.service';
import { ScrmService } from './scrm/scrm.service';
import { AppController } from './app.controller';
import { TaskController } from './task.controller';
import { BusinessController } from './business.controller';
import { InventoryController } from './inventory.controller';
import { TrainingController } from './training.controller';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, TaskController, BusinessController, InventoryController, TrainingController, AdminController],
  providers: [AiService, PrismaService, ScrmService],
})
export class AppModule {}
