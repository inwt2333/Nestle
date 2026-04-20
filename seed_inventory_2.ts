import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const product = await prisma.product.findFirst({ where: { skuCode: 'SKU_NESTLE_1' } });
  const store = await prisma.store.findFirst();
  if (product && store) {
    await prisma.inventory.create({
      data: { storeId: store.id, productId: product.id, batchCode: 'B003_' + Date.now(), productionDate: new Date('2023-03-01'), expirationDate: new Date('2025-03-01'), stock: 20 }
    });
    console.log('Seeded inventory for SKU_NESTLE_1');
  }
}
main().finally(() => prisma.$disconnect());
