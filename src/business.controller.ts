import { Controller, Post, Body, Get, Put, Param, Delete } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('business')
export class BusinessController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('customer')
  async addCustomer(
    @Body() data: { phone: string; nickname: string; babyName: string; birthDate: string; allergyInfo: string; feedingType?: string }
  ) {
    const customer = await this.prisma.customer.create({
      data: {
        openId: `OPENID_APP_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        phone: data.phone || `138${Math.floor(Math.random() * 100000000)}`,
        nickname: data.nickname,
        tags: '新客,待跟进',
        babyProfiles: {
          create: {
            name: data.babyName,
            birthDate: new Date(data.birthDate),
            allergyInfo: data.allergyInfo,
            feedingType: data.feedingType || '配方奶喂养',
          },
        },
      },
      include: { babyProfiles: true },
    });
    return { success: true, message: '会员建档成功', data: customer };
  }

  @Post('order')
  async createOrder(@Body() data: { customerId: string; quantity: number; productId?: string }) {
    const store = await this.prisma.store.findFirst();
    let product = null;

    if (data.productId) {
      product = await this.prisma.product.findUnique({ where: { id: data.productId } });
    } else {
      product = await this.prisma.product.findFirst();
    }

    if (!store || !product) {
      return { success: false, message: '系统缺少门店或测试产品数据，请重置数据库' };
    }

    const price = 299.00; // 模拟单价
    const totalAmount = price * (data.quantity || 1);

    const order = await this.prisma.order.create({
      data: {
        orderNo: 'ORD' + Date.now(),
        customerId: data.customerId,
        storeId: store.id,
        totalAmount,
        status: 'COMPLETED',
        deliveryType: 'PICKUP',
        items: {
          create: [{
            productId: product.id,
            quantity: data.quantity || 1,
            price: price,
          }],
        },
      },
    });

    // 扣减库存 (找第一批未过期库存)
    const inventory = await this.prisma.inventory.findFirst({
      where: { storeId: store.id, productId: product.id, stock: { gte: data.quantity || 1 } },
      orderBy: { expirationDate: 'asc' }
    });
    
    if (inventory) {
      await this.prisma.inventory.update({
        where: { id: inventory.id },
        data: { stock: { decrement: data.quantity || 1 } }
      });
    }

    // 消费积分累计与会员等级提升
    // 假设每消费1元得1积分，每满1000分升1级
    const customer = await this.prisma.customer.findUnique({ where: { id: data.customerId } });
    if (customer) {
      const newPoints = customer.points + Math.floor(totalAmount);
      const newLevel = Math.floor(newPoints / 1000) + 1;
      
      await this.prisma.customer.update({
        where: { id: data.customerId },
        data: { 
          points: newPoints,
          memberLevel: newLevel > customer.memberLevel ? newLevel : customer.memberLevel
        }
      });
    }

    return { success: true, message: '开单成功', data: order };
  }

  @Post('recycle')
  async scanRecycle(@Body() data: { customerId: string; serialNumber?: string }) {
    const store = await this.prisma.store.findFirst();
    const employee = await this.prisma.employee.findFirst();
    
    if (!store || !employee) return { success: false, message: '系统门店或员工数据异常' };

    const sn = data.serialNumber || `SN${Date.now()}`;
    const exist = await this.prisma.recycleRecord.findUnique({ where: { serialNumber: sn } });
    if (exist) return { success: false, message: '该空罐已核销，请勿重复扫描' };

    const record = await this.prisma.recycleRecord.create({
      data: {
        serialNumber: sn,
        customerId: data.customerId,
        storeId: store.id,
        employeeId: employee.id,
        consumerPoints: 50,
        storePoints: 10,
        status: 'COMPLETED'
      }
    });

    await this.prisma.customer.update({
      where: { id: data.customerId },
      data: { recyclePoints: { increment: 50 } }
    });

    return { success: true, message: '空罐回收成功，获取环保积分+50', data: record };
  }

  @Get('dashboard-stats')
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const store = await this.prisma.store.findFirst();
    if (!store) return { success: false };

    // 今日销售额
    const todayOrders = await this.prisma.order.findMany({
      where: { 
        storeId: store.id,
        createdAt: { gte: today }
      }
    });
    const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

    // 新增会员
    const newMembers = await this.prisma.customer.count({
      where: {
        createdAt: { gte: today }
      }
    });

    // 回收空罐
    const recycleRecords = await this.prisma.recycleRecord.count({
      where: { 
        storeId: store.id,
        createdAt: { gte: today }
      }
    });

    return {
      success: true,
      data: {
        employeeName: '李芳',
        storeName: store.name,
        todaySales: todaySales.toFixed(2),
        newMembers,
        recycleCount: recycleRecords
      }
    };
  }

  @Get('customers')
  async getCustomers() {
    return this.prisma.customer.findMany({
      include: {
        babyProfiles: true,
        orders: {
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' },
        },
        employeeTasks: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Put('customer/:id')
  async updateCustomer(@Param('id') id: string, @Body() data: { nickname: string; phone: string; tags: string; memberLevel: number; points: number; recyclePoints: number; babyName: string; birthDate: string; allergyInfo: string; feedingType: string }) {
    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        nickname: data.nickname,
        phone: data.phone,
        tags: data.tags,
        memberLevel: Number(data.memberLevel),
        points: Number(data.points),
        recyclePoints: Number(data.recyclePoints),
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
          feedingType: data.feedingType,
        }
      });
    } else {
      await this.prisma.babyProfile.create({
        data: {
          customerId: id,
          name: data.babyName,
          birthDate: new Date(data.birthDate),
          allergyInfo: data.allergyInfo,
          feedingType: data.feedingType,
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

  @Post('redeem')
  async redeemPoints(@Body() data: { customerId: string; pointsToDeduct: number; pointType: 'points' | 'recyclePoints'; giftName: string }) {
    const customer = await this.prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) return { success: false, message: '顾客不存在' };

    const deductAmount = Number(data.pointsToDeduct);
    if (data.pointType === 'recyclePoints') {
      if (customer.recyclePoints < deductAmount) return { success: false, message: '环保回收积分不足' };
      await this.prisma.customer.update({
        where: { id: data.customerId },
        data: { recyclePoints: { decrement: deductAmount } }
      });
    } else {
      if (customer.points < deductAmount) return { success: false, message: '消费积分不足' };
      await this.prisma.customer.update({
        where: { id: data.customerId },
        data: { points: { decrement: deductAmount } }
      });
    }

    return { 
      success: true, 
      message: `成功消耗 ${deductAmount} ${data.pointType === 'points' ? '消费' : '回收'}积分，已派发：${data.giftName}` 
    };
  }
}
