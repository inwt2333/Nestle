<template>
  <view class="toc-container">
    <view class="nav-header">
      <view class="title-with-back">
        <button class="back-btn" @click="goBack">⬅ 返回</button>
        <text class="page-title">雀巢罐爱计划</text>
      </view>
    </view>

    <view class="banner">
      <image class="bg" src="https://img.yzcdn.cn/vant/leaf.jpg" mode="aspectFill" />
      <view class="text-content">
        <text class="title">雀巢罐爱计划</text>
        <text class="subtitle">与您携手，共创绿色未来</text>
      </view>
    </view>

    <view class="progress-section" v-if="progress">
      <view class="donate-title">全网已回收 {{ progress.totalRecycled || 0 }} 罐</view>
      <view class="donate-subtitle">雀巢已向山区儿童捐赠 {{ progress.donatedCans || 0 }} 罐奶粉</view>
      <view class="progress-bar">
        <view class="bar-fill" :style="{ width: ((progress.progressToNextDonate / progress.target) * 100) + '%' }"></view>
      </view>
      <view class="donate-hint">再差 {{ (progress.target - progress.progressToNextDonate) }} 罐将进行下一次捐赠</view>
      <view class="rules">{{ progress.rules }}</view>
    </view>

    <view class="scan-section">
      <button class="scan-btn" @click="scanQR">识别底部溯源码，即刻回收</button>
      <view class="sub-actions">
        <button class="small-btn">查看回收门店</button>
        <button class="small-btn">预约上门取罐</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const progress = ref(null);

const goBack = () => {
  uni.navigateBack();
};

onMounted(async () => {
  try {
    const res = await uni.request({
      url: 'http://localhost:3000/api/toc/recycle/progress',
      method: 'GET'
    });
    progress.value = res.data;
  } catch (e) {
    console.error('获取回收进度失败', e);
  }
});

const scanQR = () => {
  uni.scanCode({
    success: function (res) {
      console.log('扫码结果：', res.result);
      uni.showToast({ title: '扫码成功！正在获取防伪信息...', icon: 'none' });
    }
  });
};
</script>

<style scoped>
.toc-container {
  padding: 40px 32px 54px 32px;
  background-color: #F8FAF7;
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

.banner {
  position: relative;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 32px;
  background: #C789F5;
  box-shadow: 0 8px 24px rgba(214, 193, 248, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.banner .bg {
  display: none;
}
.text-content {
  text-align: center;
  color: white;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  width: 100%;
}
.title {
  font-size: 32px;
  font-weight: 900;
  display: block;
}
.subtitle {
  font-size: 18px;
  margin-top: 8px;
  display: block;
  font-weight: 600;
}

.progress-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
  text-align: center;
  margin-bottom: 32px;
}
.donate-title {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
}
.donate-subtitle {
  font-size: 18px;
  color: #C789F5;
  font-weight: 600;
  margin-top: 8px;
  margin-bottom: 24px;
}
.progress-bar {
  width: 100%;
  height: 16px;
  background: #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #D6C1F8 0%, #C789F5 100%);
  transition: width 0.4s ease;
}
.donate-hint {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 24px;
  font-weight: 500;
}
.rules {
  font-size: 15px;
  color: #475569;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: left;
  line-height: 1.6;
}

.scan-section {
  text-align: center;
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
}
.scan-btn {
  background: #C789F5;
  color: white;
  font-size: 18px;
  font-weight: 800;
  display: block;
  width: 100%;
  padding: 16px 0;
  border-radius: 12px;
  margin-bottom: 24px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(199, 137, 245, 0.2);
}
.sub-actions {
  display: flex;
  gap: 16px;
}
.small-btn {
  flex: 1;
  background: #fff;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 16px;
  font-weight: 600;
  padding: 12px 0;
  border-radius: 8px;
  cursor: pointer;
}
</style>
