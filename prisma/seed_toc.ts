import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始为 C端模块 (ToC) 生成测试数据...');

  // 1. 创建消费者
  const c1 = await prisma.customer.upsert({
    where: { phone: '13811112222' },
    update: {},
    create: {
      phone: '13811112222',
      nickname: '宝妈丽丽',
      memberLevel: 2,
      points: 400,
      recyclePoints: 120,
      openId: 'wx_1234abc'
    }
  });

  // 2. 创建地址
  await prisma.address.createMany({
    data: [
      {
        customerId: c1.id,
        name: '丽丽',
        phone: '13811112222',
        province: '北京',
        city: '北京市',
        district: '朝阳区',
        detail: '望京SOHO塔3',
        isDefault: true
      }
    ]
  });

  // 3. 优惠券
  await prisma.coupon.create({
    data: {
      customerId: c1.id,
      name: '雀巢能恩 满299减30',
      discount: 30,
      minAmount: 299,
      status: 'UNUSED',
      validUntil: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  // 4. 活动
  await prisma.activity.create({
    data: {
      title: '雀巢超启能恩3段重磅焕新上市！',
      content: '加入雀巢环保先锋即可获得新品试用装和专属育儿大礼包。参与即可换取1000环保积分',
      status: 1
    }
  });

  // 5. 家长课堂
  await prisma.course.create({
    data: {
      title: '新生儿护理必备知识：头三个月的黄疸与吐奶预防',
      expertName: '张思莱 医师',
      videoUrl: 'https://example.com/videos/v1.mp4',
      content: '本文主要讲解...',
      category: 'NEWBORN'
    }
  });

  console.log('ToC 测试数据生成完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });