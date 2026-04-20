<template>
  <view class="toc-container">
    <view class="nav-header">
      <view class="title-with-back">
        <button class="back-btn" @click="goBack">⬅ 返回</button>
        <text class="page-title">营养小课堂</text>
      </view>
    </view>

    <view class="course-list">
      <view class="course-card" v-for="course in list" :key="course.id">
        <view class="info">
          <text class="title">{{ course.title }}</text>
          <text class="expert">👨‍⚕️ 主讲人：{{ course.expertName }}</text>
          <text class="desc">{{ course.content }}</text>
        </view>
      </view>
      <view class="empty" v-if="!list.length">暂无课程发布</view>
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
      url: 'http://localhost:3000/api/toc/courses',
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

.course-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.course-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
  transition: transform 0.2s;
}
.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
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
.expert {
  font-size: 16px;
  color: #1C75FF;
  font-weight: 600;
  display: block;
  margin-bottom: 12px;
  background: #eff6ff;
  padding: 6px 12px;
  border-radius: 6px;
  display: inline-block;
  border: 1px solid #dbeafe;
}
.desc {
  font-size: 16px;
  color: #475569;
  display: block;
  line-height: 1.6;
}
.empty {
  text-align: center;
  color: #64748b;
  padding: 60px 0;
  font-size: 18px;
}
</style>