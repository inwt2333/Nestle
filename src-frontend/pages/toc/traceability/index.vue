<template>
  <view class="toc-container">
    <view class="nav-header">
      <view class="title-with-back">
        <button class="back-btn" @click="goBack">⬅ 返回</button>
        <text class="page-title">产品溯源</text>
      </view>
    </view>

    <view class="search-box">
      <input class="src-input" v-model="skuCode" placeholder="请输入底部溯源码进行查询查询 (如: NES1001)" />
      <button class="src-btn" @click="searchTraceability">开启溯源</button>
    </view>
    
    <view class="result-card" v-if="result">
      <view class="product-name">{{ result.name }} 溯源档案</view>
      <view class="timeline">
        <view class="timeline-item" v-for="(step, index) in result.traceability" :key="index">
          <view class="time">{{ step.date }}</view>
          <view class="desc">{{ step.info }}</view>
        </view>
      </view>
      
      <view class="can-love-card">
        <text class="can-title">💚 参与罐爱计划，共创新生绿</text>
        <view class="steps">
          <text class="step-badge" v-for="s in result.caniLovePlanInfo.process" :key="s">{{ s }}</text>
          <text class="step-badge highlight">环保再生</text>
        </view>
        <text class="info">{{ result.caniLovePlanInfo.info }}，获取环保积分兑礼品。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const skuCode = ref('');
const result = ref(null);

const goBack = () => {
  uni.navigateBack();
};

const searchTraceability = async () => {
  if (!skuCode.value) {
    uni.showToast({ title: '请输入溯源码', icon: 'none' });
    return;
  }
  try {
    const res = await uni.request({
      url: `http://localhost:3000/api/toc/traceability/${skuCode.value}`,
      method: 'GET'
    });
    if (res.data && !res.data.error) {
      result.value = res.data;
    } else {
      uni.showToast({ title: '未找到溯源信息，请检查编码', icon: 'none' });
      result.value = null;
    }
  } catch (e) {
    console.error(e);
  }
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

.search-box {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
}
.src-input {
  flex: 1;
  border: 1px solid #e2e8f0;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 16px;
  background: #f8fafc;
  outline: none;
}
.src-input:focus {
  border-color: #1C75FF;
  background: #fff;
}
.src-btn {
  background: #1C75FF;
  color: #fff;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(28,117,255,0.2);
}

.result-card {
  background: #fff;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
}
.product-name {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px dashed #e2e8f0;
}
.timeline {
  border-left: 3px solid #cbd5e1;
  padding-left: 24px;
  margin-left: 12px;
  margin-bottom: 40px;
}
.timeline-item {
  position: relative;
  margin-bottom: 24px;
}
.timeline-item:last-child {
  margin-bottom: 0;
}
.timeline-item::before {
  content: '';
  position: absolute;
  left: -32.5px;
  top: 6px;
  width: 14px;
  height: 14px;
  background: #1C75FF;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(28,117,255,0.2);
}
.time {
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}
.desc {
  font-size: 18px;
  color: #334155;
  font-weight: 500;
  line-height: 1.5;
}

.can-love-card {
  background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #bbf7d0;
}
.can-title {
  font-weight: 800;
  color: #166534;
  font-size: 18px;
  display: block;
  margin-bottom: 16px;
}
.steps {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.step-badge {
  background: rgba(255,255,255,0.8);
  color: #15803d;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  border: 1px dashed #bbf7d0;
}
.step-badge.highlight {
  background: #16a34a;
  color: white;
  border: none;
}
.info {
  font-size: 15px;
  color: #166534;
  font-weight: 500;
  line-height: 1.5;
}
</style>