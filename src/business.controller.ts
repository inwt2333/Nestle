import { Controller, Post, Body, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('business')
export class BusinessController {
  constructor(private readonly prisma: PrismaService) {}

  // 1. B端店员录入新顾客与宝宝档案（或C端扫码授权主动注册）
  @Post('customer')
  async addCustomer(
    @Body() data: { phone: string; nickname: string; babyName: string; birthDate: string; allergyInfo: string }
  ) {
    const customer = await this.prisma.customer.create({
      data: {
        openId: `OPENID_APP_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // 模拟小程序在后台静默获取的 OpenID
        phone: data.phone || `138${Math.floor(Math.random() * 100000000)}`,
        nickname: data.nickname,
        babyProfiles: {
          create: {
            name: data.babyName,
            birthDate: new Date(data.birthDate),
            allergyInfo: data.allergyInfo,
          },
        },
      },
      include: { babyProfiles: true },
    });
    return { success: true, message: '会员建档成功', data: customer };
  }

  // 2. 门店收银扫码卖货 / C端下单购买
  @Post('order')
  async createOrder(@Body() data: { customerId: string; quantity: number }) {
    // 获取当前门店（单店演示环境直接取第一个）
    const store = await this.prisma.store.findFirst();
    const product = await this.prisma.product.findFirst();

    if (!store || !product) {
      return { success: false, message: '请先运行 npm run db 确保基础门店和商品存在' };
    }

    const order = await this.prisma.order.create({
      data: {
        orderNo: 'ORD' + Date.now(),
        customerId: data.customerId,
        storeId: store.id,
        totalAmount: 299.00 * (data.quantity || 1),
        status: 'COMPLETED',
        deliveryType: 'PICKUP',
        items: {
          create: [
            {
              productId: product.id,
              quantity: data.quantity || 1,
              price: 299.00,
            },
          ],
        },
      },
    });

    return { success: true, message: '开单成功', data: order };
  }

  // 3. 获取所有客户列表 (用于前端收银选择)
  @Get('customers')
  async getCustomers() {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}
