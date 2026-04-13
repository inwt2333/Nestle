import { Controller, Post, Body, Get, Put, Param, Delete } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('business')
export class BusinessController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('customer')
  async addCustomer(
    @Body() data: { phone: string; nickname: string; babyName: string; birthDate: string; allergyInfo: string }
  ) {
    const customer = await this.prisma.customer.create({
      data: {
        openId: `OPENID_APP_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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

  @Post('order')
  async createOrder(@Body() data: { customerId: string; quantity: number }) {
    const store = await this.prisma.store.findFirst();
    const product = await this.prisma.product.findFirst();

    if (!store || !product) {
      return { success: false, message: '系统缺少门店或测试产品数据，请重置数据库' };
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

  @Get('customers')
  async getCustomers() {
    return this.prisma.customer.findMany({
      include: {
        babyProfiles: true,
        employeeTasks: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Put('customer/:id')
  async updateCustomer(@Param('id') id: string, @Body() data: { nickname: string; phone: string; babyName: string; birthDate: string; allergyInfo: string }) {
    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        nickname: data.nickname,
        phone: data.phone,
      },
      include: { babyProfiles: true }
    });

    if (customer.babyProfiles && customer.babyProfiles.length > 0) {
      await this.prisma.babyProfile.update({
        where: { id: customer.babyProfiles[0].id },
        data: {
          name: data.babyName,
          birthDate: new Date(data.birthDate),
          allergyInfo: data.allergyInfo,
        }
      });
    } else {
      await this.prisma.babyProfile.create({
        data: {
          customerId: id,
          name: data.babyName,
          birthDate: new Date(data.birthDate),
          allergyInfo: data.allergyInfo
        }
      });
    }
    
    return { success: true, message: '更新成功' };
  }

  @Delete('customer/:id')
  async deleteCustomer(@Param('id') id: string) {
    try {
      const userOrders = await this.prisma.order.findMany({
        where: { customerId: id },
        select: { id: true }
      });
      const orderIds = userOrders.map(o => o.id);

      if (orderIds.length > 0) {
        await this.prisma.orderItem.deleteMany({
          where: { orderId: { in: orderIds } }
        });
      }
      
      await this.prisma.order.deleteMany({ where: { customerId: id } });
      await this.prisma.employeeTask.deleteMany({ where: { customerId: id } });
      await this.prisma.recycleRecord.deleteMany({ where: { customerId: id } });
      await this.prisma.babyProfile.deleteMany({ where: { customerId: id } });
      
      await this.prisma.customer.delete({ where: { id } });
      
      return { success: true, message: '删除成功' };
    } catch (e) {
      return { success: false, message: '删除失败: ' + String(e) };
    }
  }
}
