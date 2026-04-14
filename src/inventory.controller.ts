import { Controller, Get, Post, Body, Put, Param } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AiService } from './ai/ai.service';
import dayjs from 'dayjs';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService
  ) {}

  @Get()
  async getInventory() {
    const list = await this.prisma.inventory.findMany({
      include: { product: true },
      orderBy: { expirationDate: 'asc' }
    });
    return list.map(item => {
      const daysLeft = dayjs(item.expirationDate).diff(dayjs(), 'day');
      return {
        ...item,
        daysLeft,
        isWarning: daysLeft < 90 // 90天为临期警示
      };
    });
  }

  @Post('inbound')
  async inbound(@Body() data: { skuCode: string; batchCode: string; productionDate: string; stock: number }) {
    let product = await this.prisma.product.findUnique({ where: { skuCode: data.skuCode } });
    if (!product) {
      // 模拟扫码没有时自动创建该产品
      product = await this.prisma.product.create({
        data: {
          skuCode: data.skuCode,
          name: '智能识别产品_' + data.skuCode,
          category: 'Default',
          shelfLifeDays: 730
        }
      });
    }
    const store = await this.prisma.store.findFirst();
    if (!store) return { success: false, message: '无门店' };

    const expirationDate = dayjs(data.productionDate).add(product.shelfLifeDays, 'day').toDate();

    const inv = await this.prisma.inventory.upsert({
      where: {
        storeId_productId_batchCode: {
          storeId: store.id,
          productId: product.id,
          batchCode: data.batchCode
        }
      },
      update: {
        stock: { increment: Number(data.stock) }
      },
      create: {
        storeId: store.id,
        productId: product.id,
        batchCode: data.batchCode,
        productionDate: new Date(data.productionDate),
        expirationDate,
        stock: Number(data.stock)
      }
    });

    return { success: true, data: inv, message: '入库成功' };
  }

  @Post('stocktake')
  async stocktake(@Body() data: { id: string; actualStock: number }) {
    await this.prisma.inventory.update({
      where: { id: data.id },
      data: { stock: Number(data.actualStock) }
    });
    return { success: true, message: '盘点更新成功' };
  }

  @Get('replenish-advice')
  async getReplenishAdvice() {
    const list = await this.prisma.inventory.findMany({ include: { product: true } });
    const stockMap: Record<string, number> = {};
    list.forEach(inv => {
      const name = inv.product.name;
      if (!stockMap[name]) stockMap[name] = 0;
      stockMap[name] += inv.stock;
    });

    const statusStr = Object.keys(stockMap).length === 0 
      ? '目前没有任何库存' 
      : Object.keys(stockMap).map(k => `${k}: ${stockMap[k]}件`).join(', ');

    const prompt = `你是一个门店B2B进货AI大脑。当前我们的门店库存状态如下：\n` + 
      statusStr + 
      `\n母婴门店（如雀巢奶粉）通常单品安全健康库存为30件以上。请根据现有库存，生成一个简明扼要的【智能补货清单及建议】。要求分条列出，直接给出需要补货的产品名称和建议补货数量，不要废话，显示出专业数字化的能力。`;
    
    try {
      const advice = await this.aiService.generateText(prompt);
      return { success: true, advice };
    } catch(e) {
      return { success: false, message: 'AI 生成失败' };
    }
  }
}
