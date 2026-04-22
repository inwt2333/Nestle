import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  /* ---------------- 员工管理 ---------------- */
  @Get('employees')
  getEmployees() { return this.prisma.employee.findMany(); }

  @Post('employee')
  async createEmployee(@Body() data: any) {
    const defaultStore = await this.prisma.store.findFirst();
    if (!defaultStore) {
      return { success: false, message: '未找到关联门店' };
    }
    return this.prisma.employee.create({
      data: {
        name: data.name,
        phone: data.phone,
        role: data.role || 'CLERK',
        storeId: defaultStore.id
      }
    });
  }

  @Put('employee/:id')
  updateEmployee(@Param('id') id: string, @Body() data: any) {
    return this.prisma.employee.update({ where: { id }, data });
  }

  @Delete('employee/:id')
  async deleteEmployee(@Param('id') id: string) {
    await this.prisma.recycleRecord.deleteMany({ where: { employeeId: id } });
    await this.prisma.employeeTask.deleteMany({ where: { employeeId: id } });
    await this.prisma.assessment.deleteMany({ where: { employeeId: id } });
    return this.prisma.employee.delete({ where: { id } });
  }

  /* ---------------- 商品管理 ---------------- */
  @Get('products')
  getProducts() { return this.prisma.product.findMany(); }

  @Post('product')
  createProduct(@Body() data: { name: string; category: string; price: number; shelfLifeDays: number; imageUrl?: string }) {
    const dummySku = `SKU${Date.now()}`;
    return this.prisma.product.create({ 
      data: { 
        name: data.name, 
        category: data.category, 
        price: data.price,
        skuCode: dummySku, 
        shelfLifeDays: data.shelfLifeDays || 365,
        imageUrl: data.imageUrl
      } 
    });
  }

  @Put('product/:id')
  updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.prisma.product.update({ where: { id }, data });
  }

  @Delete('product/:id')
  async deleteProduct(@Param('id') id: string) {
    await this.prisma.inventory.deleteMany({ where: { productId: id } });
    await this.prisma.orderItem.deleteMany({ where: { productId: id } });
    return this.prisma.product.delete({ where: { id } });
  }

  /* ---------------- 积分商品管理 ---------------- */
  @Get('gifts')
  getGifts() { return this.prisma.giftItem.findMany(); }

  @Post('gift')
  createGift(@Body() data: any) {
    return this.prisma.giftItem.create({ data });
  }

  @Put('gift/:id')
  updateGift(@Param('id') id: string, @Body() data: any) {
    return this.prisma.giftItem.update({ where: { id }, data });
  }

  @Delete('gift/:id')
  deleteGift(@Param('id') id: string) {
    return this.prisma.giftItem.delete({ where: { id } });
  }

  /* ---------------- 知识库管理 ---------------- */
  @Get('knowledge')
  getKnowledge() { return this.prisma.knowledgeArticle.findMany(); }

  @Post('knowledge')
  createKnowledge(@Body() data: any) {
    return this.prisma.knowledgeArticle.create({ data });
  }

  @Put('knowledge/:id')
  updateKnowledge(@Param('id') id: string, @Body() data: any) {
    return this.prisma.knowledgeArticle.update({ where: { id }, data });
  }

  @Delete('knowledge/:id')
  deleteKnowledge(@Param('id') id: string) {
    return this.prisma.knowledgeArticle.delete({ where: { id } });
  }
}
