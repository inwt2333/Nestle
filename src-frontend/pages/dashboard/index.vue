<template>
  <view class="dashboard-container">
    <!-- 头部：极简数据总览 -->
    <view class="header-card">
      <view class="greeting">
        <text class="name">你好，{{ employeeName }} 👋</text>
        <text class="store">{{ storeName }}</text>
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">¥{{ todaySales }}</text>
          <text class="stat-label">今日销售额</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ newMembers }}</text>
          <text class="stat-label">新增会员(人)</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ recycleCount }}</text>
          <text class="stat-label">回收空罐(个)</text>
        </view>
      </view>
    </view>

    <!-- 核心操作区：快捷扫码入口 -->
    <view class="quick-actions">
      <button class="action-btn primary" @click="handleScanRecycle">
        <text class="icon">♻️</text>
        <text>空罐核销</text>
      </button>
      <button class="action-btn secondary" @click="handleAddMemberAndOrder">
        <text class="icon">👤</text>
        <text>录客开单</text>
      </button>
    </view>

    <!-- 待办任务区：自动化营销与关怀 (关联 Step 3 后端逻辑) -->
    <view class="section">
      <view class="section-header">
        <text class="title">📋 今日专属任务</text>
        <text class="badge">{{ pendingTasks.length }}个待处理</text>
      </view>
      <view class="task-list">
        <view class="task-card" v-for="task in pendingTasks" :key="task.id">
          <view class="task-info">
            <text class="task-title">{{ task.title }}</text>
            <text class="task-desc">顾客: {{ task.customerName }}</text>
            <view class="ai-speech-box">
              <text class="speech-label">✨ AI 建议话术:</text>
              <text class="speech-text">{{ task.suggestedSpeech }}</text>
            </view>
          </view>
          <button class="one-click-btn" @click="handleOneClickSend(task)">一键发送连带优惠券</button>
        </view>
        <view class="empty-state" v-if="pendingTasks.length === 0">
          <text>太棒了！今日任务已全部完成 🎉</text>
        </view>
      </view>
    </view>

    <!-- 预警区：临期库存监控 -->
    <view class="section warning-section">
      <view class="section-header">
        <text class="title">⚠️ 临期预警看板</text>
      </view>
      <view class="warning-list">
        <view class="warning-item" v-for="item in expiringInventory" :key="item.id">
          <view class="product-info">
            <text class="product-name">{{ item.productName }}</text>
            <text class="product-batch">批次: {{ item.batchCode }}</text>
          </view>
          <view class="expire-info">
            <text class="expire-days">还有 <text class="highlight">{{ item.daysLeft }}</text> 天过期</text>
            <text class="stock-count">滞销库存: {{ item.stock }} 罐</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// 假设这里引入了 uniapp 的 api，如 import { request, showToast } from '@uni/api'

// 基础数据
const employeeName = ref('李芳');
const storeName = ref('育婴坊（向阳路店）');
const todaySales = ref('3,250.00');
const newMembers = ref(5);
const recycleCount = ref(12);

// 待办任务数据 (这些数据由后端的 ScrmService 定时任务生成)
const pendingTasks = ref([
  {
    id: 't_001',
    title: '【换段提醒】宝宝满6个月',
    customerName: '王女士',
    suggestedSpeech: '王姐您好！小宝马上满6个月啦，现在店里有2段超启能恩买大送小活动和空罐回收，您可以带空罐过来直接兑换积分哦！',
    couponId: 'COUPON_STAGE2'
  },
  {
    id: 't_002',
    title: '【生日关怀】宝宝1周岁',
    customerName: '陈女士',
    suggestedSpeech: '陈姐，祝小宝1周岁生日快乐🎂！给您发了一张专属的生日无门槛代金券，有空来店里领取小礼物哦~',
    couponId: 'COUPON_BIRTHDAY'
  }
]);

// 临期库存预警数据
const expiringInventory = ref([
  {
    id: 'inv_001',
    productName: '雀巢超启能恩1段 800g',
    batchCode: 'NC202501X',
    daysLeft: 45,
    stock: 15
  }
]);

// 生命周期函数：页面加载时向后端请求最新数据
onMounted(() => {
  fetchPendingTasks();
});

// 操作方法：调用真实后端接口
const fetchPendingTasks = async () => {
  try {
    const res = await uni.request({
      url: 'http://localhost:3000/tasks',
      method: 'GET'
    });
    
    if (res.data && Array.isArray(res.data)) {
      pendingTasks.value = res.data; // 覆盖 Mock 数据，使用数据库和大模型里的真实数据！
    }
  } catch (error) {
    console.error('获取待办任务失败:', error);
  }
};

// 操作方法：一键发送话术
const handleOneClickSend = (task) => {
  // 实际项目中会调用微信 JS-SDK (wx.shareToExternalContact / wx.setClipboardData) 
  // 将文本和优惠券小程序卡片直接调起分享给对应的微信客户
  console.log(`正在转发话术与卡券: ${task.suggestedSpeech}`);
  // 模拟发送成功
  pendingTasks.value = pendingTasks.value.filter(t => t.id !== task.id);
  // uni.showToast({ title: '发送成功', icon: 'success' })
};

// 操作方法：扫码核销空罐 (连接 罐爱计划)
const handleScanRecycle = () => {
  console.log('调起摄像头扫描空罐溯源码...');
  uni.showToast({ title: '空罐回收成功，店员和顾客积分已发放！' })
};

// 操作方法：通过 API 添加真正的客户并为ta开一单
const handleAddMemberAndOrder = async () => {
  const nickname = prompt('请输入由于买奶粉新到店的妈妈称呼:', '赵女士');
  if(!nickname) return;
  const allergyInfo = prompt('请询问妈妈宝宝是否有过敏史:', '无');
  if(allergyInfo === null) return;
  
  // 我们默认给她加上一个宝宝：为了能让AI马上处理，我们设置宝宝刚出生180天
  const birthDate = new Date();
  birthDate.setDate(birthDate.getDate() - 180);
  const birthDateString = birthDate.toISOString();
  
  try {
    // 1. 发起录入客户的网络请求
    const resCustomer = await uni.request({
      url: 'http://localhost:3000/business/customer',
      method: 'POST',
      data: {
        phone: '138' + Math.floor(Math.random() * 100000000),
        nickname: nickname,
        babyName: '未命名宝宝',
        birthDate: birthDateString,
        allergyInfo: allergyInfo
      }
    });
    
    if(resCustomer.data?.success) {
      uni.showToast({ title: '顾客档案建立成功' });
      
      // 2. 发起收银的网络请求
      const newCustomerId = resCustomer.data.data.id;
      const resOrder = await uni.request({
        url: 'http://localhost:3000/business/order',
        method: 'POST',
        data: { customerId: newCustomerId, quantity: 2 }
      });
      
      if(resOrder.data?.success) {
        alert('恭喜，收银开单成功！由于设定了她宝宝今天刚刚满6个月，你可以马上去终端重新模拟触发一次凌晨AI任务，新话术就会被算出来了！');
      }
    }
  } catch (e) {
    console.error('业务办理失败:', e);
    alert('网络请求失败，请确保后台3000端口正开着');
  }
};
</script>

<style scoped>
/* 极简、大字号、高对比度的下沉市场 UI 设计规范 */
.dashboard-container {
  padding: 16px;
  background-color: #F5F7FA;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, "Segoe UI", Arial, sans-serif;
}

/* 头部卡片 */
.header-card {
  background: linear-gradient(135deg, #1890FF 0%, #0050B3 100%);
  border-radius: 12px;
  padding: 20px;
  color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.greeting {
  margin-bottom: 16px;
}

.name {
  font-size: 20px;
  font-weight: 600;
  display: block;
}

.store {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
  display: block;
}

.stats-row {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.8;
}

/* 快捷操作区 */
.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  border: none;
}

.action-btn .icon {
  margin-right: 6px;
  font-size: 18px;
}

.action-btn.primary {
  background-color: #52C41A;
  color: white;
  box-shadow: 0 4px 10px rgba(82, 196, 26, 0.2);
}

.action-btn.secondary {
  background-color: #FFFFFF;
  color: #333;
  border: 1px solid #E8E8E8;
}

/* 区块通用样式 */
.section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header .title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.badge {
  background-color: #FFF1F0;
  color: #F5222D;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* 任务卡片 */
.task-card {
  background: #FFF;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: block;
}

.task-desc {
  font-size: 14px;
  color: #666;
  display: block;
  margin-top: 6px;
}

.ai-speech-box {
  background-color: #F0F5FF;
  padding: 12px;
  border-radius: 8px;
  margin-top: 10px;
  margin-bottom: 16px;
}

.speech-label {
  font-size: 12px;
  color: #1890FF;
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
}

.speech-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.one-click-btn {
  background-color: #1890FF;
  color: #FFF;
  border: none;
  padding: 12px 0;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 30px 0;
  color: #999;
  background: #FFF;
  border-radius: 10px;
}

/* 预警列表 */
.warning-list {
  background: #FFF;
  border-radius: 10px;
  padding: 16px;
}

.warning-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #F0F0F0;
}

.warning-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.product-batch {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.expire-info {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.expire-days {
  font-size: 14px;
  color: #666;
}

.expire-days .highlight {
  color: #FAAD14;
  font-weight: bold;
  font-size: 16px;
}

.stock-count {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
