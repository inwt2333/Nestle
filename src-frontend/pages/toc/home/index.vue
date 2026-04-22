<template>
  <view class="toc-container">
    <view class="nav-header">
      <view class="title-with-back">
        <button class="back-btn" @click="goBack">⬅ 返回</button>
        <text class="page-title">雀巢消费者中心</text>
      </view>
    </view>

    <view class="user-header" @click="goTo('/pages/toc/member/index')">
      <view class="user-left">
        <img class="avatar" src="https://img.yzcdn.cn/vant/cat.jpeg" />
        <view class="info">
          <text class="nickname">{{ memberInfo.nickname || '登录' }}</text>
          <text class="level">Lv.{{ memberInfo.memberLevel || 1 }} 会员</text>
        </view>
      </view>
      <view class="points-container">
        <text class="points-label">可用积分</text>
        <text class="pt-num">{{ memberInfo.points || 0 }}</text>
      </view>
    </view>

    <view class="divider"></view>

    <!-- 核心功能模块 -->
    <view class="modules-grid">
      <view class="module-card touchable" @click="goTo('/pages/toc/mall/index')">
        <text class="icon">🛒</text>
        <text class="title">官方商城</text>
        <text class="desc">积分好礼不断</text>
      </view>
      <view class="module-card touchable" @click="goTo('/pages/toc/traceability/index')">
        <text class="icon">🔍</text>
        <text class="title">产品溯源</text>
        <text class="desc">透明看得见</text>
      </view>
      <view class="module-card touchable" @click="goTo('/pages/toc/member/index')">
        <text class="icon">💎</text>
        <text class="title">会员权益</text>
        <text class="desc">尊享关怀</text>
      </view>
      <view class="module-card touchable" @click="goTo('/pages/toc/classroom/index')">
        <text class="icon">🧑‍🏫</text>
        <text class="title">家长课堂</text>
        <text class="desc">新生儿护理和产后恢复</text>
      </view>
      
      <!-- 罐爱计划拉长 -->
      <view class="module-card highlight touchable full-width" @click="goTo('/pages/toc/recycle/index')">
        <view class="full-content">
          <text class="icon">♻️</text>
          <view class="full-text">
            <text class="title">罐爱计划</text>
            <text class="desc">线上扫码回收，守护地球做公益</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 公告区域(图片形式) -->
    <view class="notice-images">
      <text class="section-title">🎉最新活动</text>
      <img class="notice-img" :src="notice1" />
      <img class="notice-img" :src="notice2" />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import notice1 from '../../../../image/notice_1.jpg';
import notice2 from '../../../../image/notice_2.jpg';

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

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 20px 0;
  cursor: pointer;
}

.user-left {
  display: flex;
  align-items: center;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-right: 16px;
  border: 2px solid #e2e8f0;
}

.info {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
}

.level {
  font-size: 12px;
  color: #fff;
  background: #f59e0b;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  align-self: flex-start;
  font-weight: 600;
}

.points-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.points-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.pt-num {
  font-size: 24px;
  font-weight: 800;
  color: #3b82f6;
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 24px;
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

.module-card.full-width {
  grid-column: span 2;
  padding: 44px 24px; /* 增加上下内边距，让卡片显得与上方卡片一样高（长） */
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: center;
}

.full-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.full-content .icon {
  margin-bottom: 0;
  margin-right: 24px;
  font-size: 56px; /* 稍微放大图标适配高度 */
}

.full-text {
  display: flex;
  flex-direction: column;
}

.notice-images {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 30px;
  font-weight: 800;
  color: #1e293b;
  margin-top: 8px;
  margin-bottom: -4px; /* 抵消一点 gap，让标题不要离图片太远 */
}

.notice-img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: block;
}
</style>