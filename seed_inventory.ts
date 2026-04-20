import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const storeList = await prisma.store.findMany();
  let myStore = storeList[0];
  if (!myStore) {
    myStore = await prisma.store.create({ data: { name: '默认门店', address: '北京', longitude: 116.4, latitude: 39.9 } });
  }

  const p1 = await prisma.product.upsert({
    where: { skuCode: 'NC-001' },
    update: { price: 299, name: '雀巢超启能恩3段 800g', category: '奶粉' },
    create: { skuCode: 'NC-001', name: '雀巢超启能恩3段 800g', category: '奶粉', price: 299, shelfLifeDays: 730 }
  });
  const p2 = await prisma.product.upsert({
    where: { skuCode: 'NC-002' },
    update: { price: 359, name: '雀巢蓝海能恩3段 800g', category: '奶粉' },
    create: { skuCode: 'NC-002', name: '雀巢蓝海能恩3段 800g', category: '奶粉', price: 359, shelfLifeDays: 730 }
  });
  
  await prisma.inventory.create({
    data: { storeId: myStore.id, productId: p1.id, batchCode: 'B001_' + Date.now(), productionDate: new Date('2023-01-01'), expirationDate: new Date('2025-01-01'), stock: 50 }
  });
  await prisma.inventory.create({
    data: { storeId: myStore.id, productId: p2.id, batchCode: 'B002_' + Date.now(), productionDate: new Date('2023-02-01'), expirationDate: new Date('2025-02-01'), stock: 30 }
  });
  console.log('Seeded products and inventory!');
}
main().finally(() => prisma.$disconnect());
