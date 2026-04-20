<template>
  <view class="toc-container">
    <view class="nav-header">
      <view class="title-with-back">
        <button class="back-btn" @click="goBack">⬅ 返回</button>
        <text class="page-title">会员权益</text>
      </view>
    </view>

    <view class="points-card">
      <text class="title">我的可用积分</text>
      <view class="points-row">
        <view class="pt-item">
          <text class="num">{{ memberInfo.points || 0 }}</text>
          <text class="label">消费积分</text>
        </view>
        <view class="pt-item">
          <text class="num green">{{ memberInfo.recyclePoints || 0 }}</text>
          <text class="label">环保积分</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="sec-title">我的优惠券</view>
      <view class="coupon-list">
        <view class="coupon-card" v-for="c in coupons" :key="c.id">
          <view class="left">
            <text class="discount">￥<text class="big">{{ c.discount }}</text></text>
            <text class="min">满{{ c.minAmount }}可用</text>
          </view>
          <view class="right">
            <text class="name">{{ c.name }}</text>
            <text class="time">有效期至: {{ formatDate(c.validUntil) }}</text>
            <button class="use-btn" v-if="c.status === 'UNUSED'">去使用</button>
            <text class="used-text" v-else>已使用</text>
          </view>
        </view>
        <view v-if="!coupons.length" class="empty">暂无优惠券</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const memberInfo = ref({});
const coupons = ref([]);

const goBack = () => {
  uni.navigateBack();
};

onMounted(async () => {
  const customerId = uni.getStorageSync('customerId') || '94a48d8f-5e06-4767-a52c-5b0f268a47aa';
  try {
    const res = await uni.request({
      url: `http://localhost:3000/api/toc/customer/${customerId}/member-info`,
      method: 'GET'
    });
    if (res.data && res.data.id) {
      memberInfo.value = res.data;
      coupons.value = res.data.coupons || [];
    }
  } catch (e) {
    console.error(e);
  }
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
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
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
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

.points-card {
  background: linear-gradient(135deg, #1C75FF 0%, #4FC3F7 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  margin-bottom: 40px;
  box-shadow: 0 8px 24px rgba(28, 117, 255, 0.3);
}
.points-card .title {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.9;
}
.points-row {
  display: flex;
  margin-top: 24px;
}
.pt-item {
  flex: 1;
}
.num {
  font-size: 40px;
  font-weight: 900;
  display: block;
}
.num.green {
  color: #dcfce7;
}
.label {
  font-size: 16px;
  font-weight: 600;
  opacity: 0.8;
}

.section {
  margin-top: 24px;
}
.sec-title {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 24px;
}
.coupon-card {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
}
.coupon-card .left {
  background: #fef2f2;
  color: #ef4444;
  width: 140px;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 2px dashed #fecaca;
}
.left .discount { font-size: 18px; }
.left .big { font-size: 36px; font-weight: 900; }
.left .min { font-size: 14px; font-weight: 500; margin-top: 8px; }
.coupon-card .right {
  flex: 1;
  padding: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.right .name { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 12px; }
.right .time { font-size: 15px; color: #64748b; font-weight: 500; }
.use-btn {
  position: absolute;
  right: 24px;
  bottom: 24px;
  background: #ef4444;
  color: white;
  font-size: 15px;
  font-weight: 700;
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
}
.used-text {
  position: absolute;
  right: 24px;
  bottom: 24px;
  color: #94a3b8;
  font-size: 16px;
  font-weight: 700;
}
.empty {
  text-align: center;
  color: #64748b;
  padding: 60px 0;
  font-size: 18px;
}
</style>
