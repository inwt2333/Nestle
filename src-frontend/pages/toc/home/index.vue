<template>
  <view class="toc-container">
    <view class="nav-header">
      <view class="title-with-back">
        <button class="back-btn" @click="goBack">⬅ 返回</button>
        <text class="page-title">雀巢消费者中心</text>
      </view>
    </view>

    <view class="header-card">
      <view class="member-header" @click="goTo('/pages/toc/member/index')">
        <image class="avatar" src="https://img.yzcdn.cn/vant/cat.jpeg" />
        <view class="info">
          <text class="nickname">{{ memberInfo.nickname || '登录' }}</text>
          <text class="level">会员等级: {{ memberInfo.memberLevel || 1 }}</text>
        </view>
        <view class="points">可用积分: <text class="pt-num">{{ memberInfo.points || 0 }}</text></view>
      </view>
    </view>

    <!-- 核心功能模块 -->
    <view class="modules-grid">
      <view class="module-card touchable" @click="goTo('/pages/toc/mall/index')">
        <text class="icon">🛒</text>
        <text class="title">官方商城</text>
        <text class="desc">积分好礼不断</text>
      </view>
      <view class="module-card touchable" @click="goTo('/pages/toc/activity/index')">
        <text class="icon">🎉</text>
        <text class="title">最新活动</text>
        <text class="desc">福利抢先知</text>
      </view>
      <view class="module-card touchable" @click="goTo('/pages/toc/traceability/index')">
        <text class="icon">🔍</text>
        <text class="title">产品溯源</text>
        <text class="desc">透明看得见</text>
      </view>
      <view class="module-card highlight touchable" @click="goTo('/pages/toc/recycle/index')">
        <text class="icon">♻️</text>
        <text class="title">罐爱计划</text>
        <text class="desc">扫码回收做公益</text>
      </view>
      <view class="module-card touchable" @click="goTo('/pages/toc/member/index')">
        <text class="icon">💎</text>
        <text class="title">会员权益</text>
        <text class="desc">尊享关怀</text>
      </view>
      <view class="module-card touchable" @click="goTo('/pages/toc/classroom/index')">
        <text class="icon">👶</text>
        <text class="title">家长课堂</text>
        <text class="desc">新生儿护理指南</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const memberInfo = ref({});

onMounted(async () => {
  const customerId = uni.getStorageSync('customerId') || '94a48d8f-5e06-4767-a52c-5b0f268a47aa';
  try {
    const res = await uni.request({
      url: `http://localhost:3000/api/toc/customer/${customerId}/member-info`,
      method: 'GET'
    });
    if (res.data && res.data.id) {
      memberInfo.value = res.data;
    }
  } catch (e) {
    console.error('获取会员信息失败', e);
  }
});

const goTo = (url) => {
  uni.navigateTo({ url });
};

const goBack = () => {
  uni.navigateBack();
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

.header-card {
  background: linear-gradient(135deg, #1C75FF 0%, #4FC3F7 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 10px 20px rgba(28, 117, 255, 0.15);
  color: white;
  cursor: pointer;
}
.member-header {
  display: flex;
  align-items: center;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 24px;
  border: 3px solid rgba(255,255,255,0.3);
}
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.nickname {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 6px;
}
.level {
  font-size: 16px;
  opacity: 0.9;
  background: rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
  align-self: flex-start;
}
.points {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.95;
}
.pt-num {
  font-size: 32px;
  font-weight: 800;
  margin-left: 8px;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
.module-card {
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f1f5f9;
}
.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
.module-card.highlight {
  background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
}
.icon {
  font-size: 48px;
  display: block;
  margin-bottom: 20px;
}
.title {
  font-size: 20px;
  font-weight: 800;
  color: #334155;
  margin-bottom: 8px;
  display: block;
}
.desc {
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
}
.touchable {
  cursor: pointer;
}
</style>