import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始插入测试数据 Seed...');

  // 1. 创建门店
  const store = await prisma.store.create({
    data: {
      name: '雀巢体验店（海珠店）',
      address: '广州市海珠区新港西路135号',
      longitude: 114.123,
      latitude: 22.456,
    },
  });

  // 2. 创建店员
  const employee = await prisma.employee.create({
    data: {
      storeId: store.id,
      name: '仔细听',
      phone: '13800138000',
    },
  });

  // 3. 创建消费者
  const customer = await prisma.customer.create({
    data: {
      openId: 'MOCK_WX_OPENID_9999',
      phone: '13911112222',
      nickname: '张女士',
    },
  });

  // 4. 创建刚好满 180 天的宝宝（触发我们的 6 个月关怀规则）
  const baby = await prisma.babyProfile.create({
    data: {
      customerId: customer.id,
      name: '小汤圆',
      birthDate: dayjs().subtract(180, 'day').startOf('day').toDate(), // 刚好今天触发
      allergyInfo: '轻度牛奶蛋白过敏',
    },
  });

  // 5. 创建订单以将客户与门店挂钩
  const product = await prisma.product.create({
    data: {
      skuCode: 'SKU_NESTLE_1',
      name: '雀巢超启能恩1段 800g',
      category: '奶粉',
      shelfLifeDays: 730,
    },
  });

  await prisma.order.create({
    data: {
      orderNo: 'ORD' + Date.now(),
      customerId: customer.id,
      storeId: store.id,
      totalAmount: 299.00,
      status: 'COMPLETED',
      deliveryType: 'PICKUP',
      items: {
        create: [
          {
            productId: product.id,
            quantity: 1,
            price: 299.00,
          },
        ],
      },
    },
  });

  console.log('Seed 数据插入完成！');
  console.log({
    storeName: store.name,
    customer: customer.nickname,
    babyName: baby.name,
    babyBirthDate: baby.birthDate,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
