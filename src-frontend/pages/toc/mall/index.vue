<template>
  <view class="toc-container">
    <view class="nav-header">
      <view class="title-with-back">
        <button class="back-btn" @click="goBack">⬅ 返回</button>
        <text class="page-title">官方商城</text>
      </view>
    </view>

    <view class="tabs">
      <view :class="['tab', currentTab === 'products' ? 'active' : '']" @click="currentTab = 'products'">选购产品</view>
      <view :class="['tab', currentTab === 'orders' ? 'active' : '']" @click="currentTab = 'orders'">我的订单</view>
      <view :class="['tab', currentTab === 'address' ? 'active' : '']" @click="currentTab = 'address'">地址管理</view>
    </view>

    <scroll-view class="content-scroll" scroll-y>
      <!-- 商品列表 -->
      <view v-if="currentTab === 'products'" class="product-list">
        <view class="product-card" v-for="p in products" :key="p.id">
          <img :src="p.imageUrl || 'https://img.yzcdn.cn/vant/ipad.jpeg'" class="cover" />
          <view class="info">
            <text class="name">{{ p.name }}</text>
            <view class="price-stock">
              <text class="price">￥{{ p.price }}</text>
              <text class="stock">库存 {{ p.stock || 0 }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单列表 -->
      <view v-if="currentTab === 'orders'" class="order-list">
        <view class="order-card" v-for="o in orders" :key="o.id">
          <view class="order-header">
            <text class="no">订单号: {{ o.orderNo }}</text>
            <text class="status">{{ o.status }}</text>
          </view>
          <view class="items">
            <view class="item" v-for="item in o.items" :key="item.id">
              {{ item.product?.name }} <text class="quantity">x{{ item.quantity }}</text>
            </view>
          </view>
          <view class="order-footer">
            <text class="total">共 {{ o.items?.length }} 件，应付: ￥{{ o.totalAmount }}</text>
          </view>
        </view>
        <view v-if="!orders.length" class="empty">暂时还没有订单，快去选购吧！</view>
      </view>

      <!-- 地址管理 -->
      <view v-if="currentTab === 'address'" class="address-list">
        <view class="address-card" v-for="a in addresses" :key="a.id">
          <view class="main">
            <text class="name">{{ a.name }}</text>
            <text class="phone">{{ a.phone }}</text>
            <text class="tag" v-if="a.isDefault">默认地址</text>
          </view>
          <view class="detail">{{ a.province }} {{ a.city }} {{ a.district }} {{ a.detail }}</view>
        </view>
        <button class="add-addr-btn" @click="addDemoAddress">+ 新增收货地址</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const currentTab = ref('products');
const products = ref([]);
const orders = ref([]);
const addresses = ref([]);

const goBack = () => {
  uni.navigateBack();
};

const loadData = async () => {
  const customerId = uni.getStorageSync('customerId') || '94a48d8f-5e06-4767-a52c-5b0f268a47aa';
  
  if (currentTab.value === 'products') {
    const res = await uni.request({ url: 'http://localhost:3000/api/toc/products' });
    products.value = res.data || [];
  } else if (currentTab.value === 'orders') {
    const res = await uni.request({ url: `http://localhost:3000/api/toc/customer/${customerId}/orders` });
    orders.value = res.data || [];
  } else if (currentTab.value === 'address') {
    const res = await uni.request({ url: `http://localhost:3000/api/toc/customer/${customerId}/addresses` });
    addresses.value = res.data || [];
  }
};

onMounted(loadData);
watch(currentTab, loadData);

const addDemoAddress = async () => {
  const customerId = uni.getStorageSync('customerId') || '94a48d8f-5e06-4767-a52c-5b0f268a47aa';
  await uni.request({
    url: `http://localhost:3000/api/toc/customer/${customerId}/addresses`,
    method: 'POST',
    data: {
      name: '王小明',
      phone: '13812345678',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国路 88 号',
      isDefault: true
    }
  });
  loadData();
  uni.showToast({ title: '添加成功' });
};
</script>

<style scoped>
.toc-container {
  padding: 40px 32px 54px 32px;
  background-color: #F5F7FA;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1e293b;
  display: flex;
  flex-direction: column;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.title-with-back {
  display: flex;
  align-items: center;
  gap: 20px;
}
.back-btn {
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
}

.tabs {
  display: flex;
  background: transparent;
  margin-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}
.tab.active {
  color: #1C75FF;
}
.tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 30%;
  width: 40%;
  height: 4px;
  background: #1C75FF;
  border-radius: 4px 4px 0 0;
}
.content-scroll {
  flex: 1;
}

/* Products */
.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.product-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
}
.product-card .cover {
  width: 100%;
  aspect-ratio: 1 / 1;
  height: auto;
  border-radius: 8px;
  margin-bottom: 12px;
  object-fit: cover;
  border: 1px solid #e2e8f0;
}
.product-card .info {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.info .name {
  font-size: 16px;
  font-weight: 800;
  color: #000000;
  line-height: 1.4;
  margin-bottom: 8px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.info .price-stock {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}
.info .price {
  color: #ef4444;
  font-size: 20px;
  font-weight: 800;
}
.info .stock {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}

/* Orders */
.order-card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 24px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
}
.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 16px;
  color: #64748b;
  font-weight: 600;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 16px;
}
.order-header .status {
  color: #10b981;
}
.items {
  padding: 12px 0;
}
.item {
  font-size: 18px;
  color: #334155;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
}
.item .quantity {
  color: #94a3b8;
  font-weight: 600;
}
.order-footer {
  text-align: right;
  margin-top: 16px;
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
}

/* Address */
.address-card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 24px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
}
.address-card .main {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.main .name {
  font-size: 20px;
  font-weight: 800;
  margin-right: 16px;
  color: #1e293b;
}
.main .phone {
  font-size: 18px;
  color: #64748b;
  margin-right: 16px;
}
.main .tag {
  background: #f0fdf4;
  color: #16a34a;
  font-size: 14px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
}
.address-card .detail {
  font-size: 16px;
  color: #475569;
  line-height: 1.5;
}
.add-addr-btn {
  margin-top: 16px;
  background: #fff;
  border: 2px dashed #cbd5e1;
  color: #64748b;
  font-size: 18px;
  font-weight: 700;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}
.add-addr-btn:hover {
  border-color: #1C75FF;
  color: #1C75FF;
}

.empty {
  text-align: center;
  background: #fff;
  border-radius: 12px;
  padding: 60px 0;
  color: #64748b;
  font-size: 18px;
  font-weight: 600;
  border: 1px solid #f1f5f9;
}
</style>