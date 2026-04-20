<template>
  <view class="toc-container">
    <view class="nav-header">
      <view class="title-with-back">
        <button class="back-btn" @click="goBack">⬅ 返回</button>
        <text class="page-title">最新活动</text>
      </view>
    </view>

    <view class="activity-list">
      <view class="activity-card" v-for="act in list" :key="act.id">
        <image class="cover" :src="act.coverUrl || 'https://img.yzcdn.cn/vant/cat.jpeg'" mode="aspectFill" />
        <view class="info">
          <text class="title">{{ act.title }}</text>
          <text class="desc">{{ act.content }}</text>
          <view class="btn-row">
            <button class="join-btn">立即参与</button>
          </view>
        </view>
      </view>
      <view class="empty" v-if="!list.length">暂无活动发布</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const list = ref([]);

const goBack = () => {
  uni.navigateBack();
};

onMounted(async () => {
  try {
    const res = await uni.request({
      url: 'http://localhost:3000/api/toc/activities',
      method: 'GET'
    });
    list.value = res.data;
  } catch (e) {
    console.error(e);
  }
});
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

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.activity-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
  transition: transform 0.2s;
}
.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
.cover {
  width: 100%;
  height: 240px;
  display: block;
  object-fit: cover;
}
.info {
  padding: 24px;
}
.title {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  display: block;
  margin-bottom: 12px;
  line-height: 1.4;
}
.desc {
  font-size: 16px;
  color: #475569;
  display: block;
  line-height: 1.6;
  margin-bottom: 24px;
}
.btn-row {
  display: flex;
  justify-content: flex-end;
}
.join-btn {
  background: #1C75FF;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  padding: 12px 32px;
  border-radius: 24px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(28,117,255,0.2);
}
.empty {
  text-align: center;
  color: #64748b;
  padding: 60px 0;
  font-size: 18px;
}
</style>