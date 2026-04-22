import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('api/toc')
export class TocController {
  constructor(private readonly prisma: PrismaService) {}

  // 1. 官方商城功能
  @Get('products')
  async getMallProducts() {
    const products = await this.prisma.product.findMany({
      include: { inventories: true }
    });
    
    return products.map(p => {
      const totalStock = p.inventories.reduce((sum, inv) => sum + inv.stock, 0);
      return {
        id: p.id,
        skuCode: p.skuCode,
        name: p.name,
        category: p.category,
        price: p.price,
        shelfLifeDays: p.shelfLifeDays,
        imageUrl: p.imageUrl,
        stock: totalStock,
      };
    });
  }

  @Get('customer/:id/addresses')
  async getAddresses(@Param('id') customerId: string) {
    return this.prisma.address.findMany({
      where: { customerId }
    });
  }

  @Post('customer/:id/addresses')
  async addAddress(
    @Param('id') customerId: string,
    @Body() body: { name: string; phone: string; province: string; city: string; district: string; detail: string; isDefault: boolean }
  ) {
    if (body.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerId },
        data: { isDefault: false }
      });
    }
    return this.prisma.address.create({
      data: { ...body, customerId }
    });
  }

  @Get('customer/:id/orders')
  async getOrders(@Param('id') customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: { product: true }
        },
        store: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 2. 最新活动
  @Get('activities')
  async getActivities() {
    return this.prisma.activity.findMany({
      where: { status: 1 },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 3. 产品溯源
  @Get('traceability/:skuCode')
  async getTraceability(@Param('skuCode') skuCode: string) {
    const product = await this.prisma.product.findUnique({
      where: { skuCode }
    });
    if (!product) return { error: 'Product not found' };
    return {
      name: product.name,
      traceability: product.traceability, // 包含成分、功效、全生命周期节点（包含从原产地到生产包装）
      caniLovePlanInfo: {
         process: ['投罐', '压罐', '再生'],
         info: '扫底部二维码完成环保任务'
      }
    };
  }

  // 4. 罐爱计划
  @Get('recycle/progress')
  async getRecycleProgress() {
    // 每回收 10,000 罐，向山区捐赠 100 罐
    const dbCount = await this.prisma.recycleRecord.count({
      where: { status: 'COMPLETED' }
    });
    const totalRecycled = 5204 + dbCount;
    const donatedCans = Math.floor(totalRecycled / 10000) * 100;
    const progressToNextDonate = totalRecycled % 10000;
    
    return {
      totalRecycled,
      donatedCans,
      progressToNextDonate,
      target: 10000,
      rules: '回收规则：每扫码投递一个空罐得环保积分，累计一万罐雀巢将捐助贫困山区'
    };
  }

  // 5. 会员权益
  @Get('customer/:id/member-info')
  async getMemberInfo(@Param('id') customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        coupons: true
      }
    });
    return customer;
  }

  // 6. 家长课堂
  @Get('courses')
  async getCourses() {
    const list = await this.prisma.knowledgeArticle.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return list.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      expertName: '雀巢育儿专家',
      videoUrl: item.videoUrl || 'https://vjs.zencdn.net/v/oceans.mp4',
      coverUrl: 'https://img.yzcdn.cn/vant/ipad.jpeg',
    }));
  }
}
