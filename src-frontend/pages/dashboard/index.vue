<template>
  <view class="dashboard-container">
    <view class="nav-bar">
      <view class="logo-box">🍼 <text class="logo-text">bC数字化平台</text></view>
      <view class="nav-actions">
        <button class="nav-btn" @click="goToCustomers">👥 客情中心</button>
        <button class="nav-btn" @click="goToInventory">📦 仓储与补货</button>
        <button class="nav-btn" @click="goToTraining">🎓 店员培训</button>
        <button class="nav-btn" @click="goToAdmin">⚙️ 管理后台</button>
      </view>
    </view>
    
    <view class="header-card sweep-bg">
      <view class="greeting">
        <text class="name">你好，{{ employeeName }} 👋</text>
        <text class="store">📍 {{ storeName }}</text>
      </view>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">¥{{ todaySales }}</text>
          <text class="stat-label">今日销售额</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ newMembers }}</text>
          <text class="stat-label">新增会员</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ recycleCount }}</text>
          <text class="stat-label">回收空罐</text>
        </view>
      </view>
    </view>

    <view class="quick-actions">
      <button class="action-btn recycle-bg" @click="handleScanRecycle">
        <text class="icon">♻️</text>
        <text class="btn-text">空罐核销</text>
      </button>
      <button class="action-btn add-bg" @click="showAddModal = true">
        <text class="icon">➕</text>
        <text class="btn-text">录客开单</text>
      </button>
    </view>

    <!-- 空罐回收弹窗 -->
    <view class="modal-overlay" v-if="showRecycleModal">
      <view class="modal-box slide-up">
        <view class="modal-header">
          <text class="modal-title">空罐回收核销</text>
          <text class="close-btn" @click="showRecycleModal = false">✕</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">绑定顾客</text>
          <select class="form-input" v-model="recycleForm.customerId">
            <option disabled value="">请选择核销顾客...</option>
            <option v-for="c in customersList" :key="c.id" :value="c.id">{{ c.nickname || c.phone }}</option>
          </select>
        </view>

        <view class="form-item">
          <text class="form-label">罐底溯源码</text>
          <input class="form-input" v-model="recycleForm.serialNumber" placeholder="点击扫码或手动输入(选填)" />
        </view>
        
        <button class="submit-btn bounce" @click="submitRecycle">确认回收返积分</button>
      </view>
    </view>

    <!-- 自定义录客弹窗 -->
    <view class="modal-overlay" v-if="showAddModal">
      <view class="modal-box slide-up">
        <view class="modal-header">
          <text class="modal-title">新客开单建档</text>
          <text class="close-btn" @click="showAddModal = false">✕</text>
        </view>
        
        <view class="form-item">
          <text class="form-label">顾客称呼</text>
          <input class="form-input" v-model="form.nickname" placeholder="如: 陈女士" />
        </view>
        <view class="form-item">
          <text class="form-label">手机号码</text>
          <input class="form-input" v-model="form.phone" type="tel" placeholder="请输入真实的11位手机号" />
        </view>
        <view class="form-item">
          <text class="form-label">宝宝昵称</text>
          <input class="form-input" v-model="form.babyName" placeholder="如: 小汤圆" />
        </view>
        <view class="form-item">
          <text class="form-label">出生日期</text>
          <input class="form-input" v-model="form.birthDate" type="date" />
        </view>
        <view class="form-item">
          <text class="form-label">过敏史</text>
          <input class="form-input" v-model="form.allergyInfo" placeholder="如: 无 / 牛奶蛋白过敏" />
        </view>
        
        <button class="submit-btn bounce" @click="handleSubmitMemberAndOrder">建档并自动开单</button>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <view class="title-with-icon">
          <text class="title">📋 专属营销任务</text>
        </view>
        <text class="badge pulse">{{ pendingTasks.length }} 个待处理</text>
      </view>
      
      <view class="task-list">
        <view class="task-card" v-for="task in pendingTasks" :key="task.id">
          <view class="task-info">
            <view class="task-head">
              <text class="task-title">{{ task.title }}</text>
              <text class="task-customer">👤 {{ task.customerName }}</text>
            </view>
            <view class="ai-speech-box">
              <text class="speech-label">🤖 AI 建议话术:</text>
              <text class="speech-text">{{ task.suggestedSpeech }}</text>
            </view>
          </view>
          <view class="act-box">
             <button class="one-click-btn ripple" @click="handleOneClickSend(task)">✔ 一键发送连带卡券</button>
             <button class="close-task-btn" @click="handleIgnoreTask(task.id)">✕ 忽略</button>
          </view>
        </view>
        
        <view class="empty-state" v-if="pendingTasks.length === 0">
          <view class="empty-icon">🎉</view>
          <text class="empty-txt">太棒了！今日没有需要关怀的任务</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const employeeName = ref('李芳');
const storeName = ref('加载中...');
const todaySales = ref('0.00');
const newMembers = ref(0);
const recycleCount = ref(0);

const pendingTasks = ref([]);

// 弹窗状态与表单绑定
const showAddModal = ref(false);
const form = ref({
  nickname: '',
  phone: '',
  babyName: '',
  birthDate: '', 
  allergyInfo: '无'
});

// 空罐回收弹窗绑定
const showRecycleModal = ref(false);
const customersList = ref([]);
const recycleForm = ref({
  customerId: '',
  serialNumber: ''
});

onMounted(() => {
  fetchDashboardStats();
  fetchPendingTasks();
});

const fetchDashboardStats = async () => {
  try {
    const res = await uni.request({
      url: 'http://localhost:3000/business/dashboard-stats',
      method: 'GET'
    });
    if (res.data?.success) {
      employeeName.value = res.data.data.employeeName;
      storeName.value = res.data.data.storeName;
      todaySales.value = res.data.data.todaySales;
      newMembers.value = res.data.data.newMembers;
      recycleCount.value = res.data.data.recycleCount;
    }
  } catch (e) {
    console.error('获取基础数据失败', e);
  }
};

const fetchPendingTasks = async () => {
  try {
    const res = await uni.request({
      url: 'http://localhost:3000/tasks',
      method: 'GET'
    });
    if (res.data && Array.isArray(res.data)) {
      pendingTasks.value = res.data;
    }
  } catch (error) {
    console.error('获取待办任务失败:', error);
  }
};

const handleOneClickSend = async (task) => {
  try {
    await uni.request({
      url: `http://localhost:3000/tasks/${task.id}/complete`,
      method: 'PUT'
    });
    pendingTasks.value = pendingTasks.value.filter(t => t.id !== task.id);
    uni.showToast({ title: '✓ 已发送顾客微信', icon: 'none' });
  } catch (e) {
    console.error(e);
  }
};

const handleIgnoreTask = async (taskId) => {
  try {
    await uni.request({
      url: `http://localhost:3000/tasks/${taskId}/ignore`,
      method: 'PUT'
    });
    pendingTasks.value = pendingTasks.value.filter(t => t.id !== taskId);
    uni.showToast({ title: '✕ 任务已忽略', icon: 'none' });
  } catch (e) {
    console.error(e);
  }
};

const handleScanRecycle = async () => {
  try {
    const res = await uni.request({
      url: 'http://localhost:3000/business/customers',
      method: 'GET'
    });
    if (res.data) {
      customersList.value = res.data;
    }
    showRecycleModal.value = true;
  } catch (e) {
    console.error('获取顾客列表失败', e);
  }
};

const submitRecycle = async () => {
  if (!recycleForm.value.customerId) {
    uni.showToast({ title: '请选择绑定顾客', icon: 'none' });
    return;
  }
  try {
    const res = await uni.request({
      url: 'http://localhost:3000/business/recycle',
      method: 'POST',
      data: recycleForm.value
    });
    if (res.data?.success) {
      uni.showToast({ title: res.data.message, icon: 'none' });
      showRecycleModal.value = false;
      recycleForm.value = { customerId: '', serialNumber: '' };
      fetchDashboardStats();
    } else {
      uni.showToast({ title: res.data?.message || '核销失败', icon: 'none' });
    }
  } catch (e) {
    console.error('回收失败', e);
  }
};

const handleSubmitMemberAndOrder = async () => {
  if(!form.value.nickname || !form.value.phone) {
    alert('请填写顾客称呼和手机号码');
    return;
  }
  
  let submitDate = form.value.birthDate;
  if (!submitDate) submitDate = new Date().toISOString(); // 如果没填，默认今天
  else submitDate = new Date(submitDate).toISOString();

  try {
    const resCustomer = await uni.request({
      url: 'http://localhost:3000/business/customer',
      method: 'POST',
      data: {
        phone: form.value.phone,
        nickname: form.value.nickname,
        babyName: form.value.babyName || `${form.value.nickname}的宝宝`,
        birthDate: submitDate,
        allergyInfo: form.value.allergyInfo || '无'
      }
    });

    if(resCustomer.data?.success) {
      uni.showToast({ title: '建档成功', icon: 'none' });
      await uni.request({
        url: 'http://localhost:3000/business/order',
        method: 'POST',
        data: { customerId: resCustomer.data.data.id, quantity: 2 }
      });
      alert('已成功自动开单 (联动扣减库存/增加积分/计算销售额)并建入档案！稍后可访问 localhost:3000/trigger-scrm 触发AI任务');
      showAddModal.value = false;
      // 清空表单
      form.value = { nickname:'', phone:'', babyName:'', birthDate:'', allergyInfo:'无'};
      fetchDashboardStats();
      fetchPendingTasks();
    }
  } catch (e) {
    console.error(e);
  }
};

const goToCustomers = () => {
  uni.navigateTo({ url: '/pages/customers/index' });
};

const goToInventory = () => {
  uni.navigateTo({ url: '/pages/inventory/index' });
};

const goToAdmin = () => { uni.navigateTo({ url: '/pages/admin/index' }); };
const goToTraining = () => {
  uni.navigateTo({ url: '/pages/training/index' });
};
</script>

<style scoped>
/* =========== 现代化/拟真 UI 设计 =========== */
.dashboard-container {
  padding: 40rpx 30rpx;
  background-color: #F0F4FC;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, system-ui, "Segoe UI", Roboto, sans-serif;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.logo-box {
  font-size: 34rpx;
  font-weight: 900;
  color: #0056D2;
}

.nav-btn {
  background: #FFF;
  color: #0056D2;
  font-size: 26rpx;
  font-weight: bold;
  padding: 14rpx 32rpx;
  border-radius: 40rpx;
  border: none;
  box-shadow: 0 6rpx 16rpx rgba(0,86,210,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.nav-btn:active { transform: scale(0.95); }

.header-card {
  position: relative;
  background: linear-gradient(135deg, #0052CC 0%, #0076FF 100%);
  padding: 40rpx 40rpx 50rpx;
  border-radius: 32rpx;
  color: #fff;
  margin-bottom: 40rpx;
  box-shadow: 0 16rpx 30rpx rgba(0, 118, 255, 0.25);
  overflow: hidden;
}

.sweep-bg::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 10%, transparent 60%);
}

.greeting .name { font-size: 44rpx; font-weight: 800; display: block; margin-bottom: 8rpx; }
.greeting .store { font-size: 26rpx; opacity: 0.85; font-weight: 500; }

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-top: 50rpx;
}

.stat-item { text-align: center; flex: 1; position: relative; }
.stat-item:not(:last-child)::after {
  content: ""; position: absolute; right: 0; top: 10%; height: 80%; width: 1px; background: rgba(255,255,255,0.2);
}

.stat-value { font-size: 40rpx; font-weight: 900; display: block; margin-bottom: 8rpx; }
.stat-label { font-size: 22rpx; opacity: 0.8; }

.quick-actions {
  display: flex;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.action-btn {
  flex: 1;
  padding: 30rpx 0;
  border-radius: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.06);
}

.action-btn:active { transform: scale(0.96); }

.recycle-bg { background: #FFF; border: 2rpx solid #E8F0FE; }
.recycle-bg .icon { color: #00BA7A; text-shadow: 0 4rpx 10rpx rgba(0,186,122,0.3); }
.recycle-bg .btn-text { color: #333; font-weight: 700; font-size: 28rpx; }

.add-bg { background: linear-gradient(135deg, #0056D2, #0045A8); color: #FFF; }
.add-bg .icon { color: #FFF; text-shadow: 0 4rpx 10rpx rgba(0,0,0,0.2); }
.add-bg .btn-text { font-weight: 700; font-size: 28rpx; }

.icon { font-size: 56rpx; margin-bottom: 12rpx; display: block; }

.section {
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.03);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title { font-size: 34rpx; font-weight: 900; color: #222; }

.badge {
  background: #FFE8E8;
  color: #FF4D4F;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-weight: 800;
}

.pulse { animation: pulse 2s infinite; }
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.task-list { display: flex; flex-direction: column; gap: 24rpx; }

.task-card {
  background: #FAFBFC;
  border-radius: 24rpx;
  padding: 28rpx;
  border: 1px solid #EAECEF;
}

.task-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16rpx; }
.task-title { font-size: 30rpx; font-weight: 800; color: #111; }
.task-customer { font-size: 26rpx; color: #666; font-weight: 600; padding: 4rpx 12rpx; background: #EEE; border-radius: 12rpx; }

.ai-speech-box {
  background: #FFF;
  padding: 24rpx;
  border-radius: 16rpx;
  border-left: 8rpx solid #0076FF;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  margin-bottom: 24rpx;
}

.speech-label { font-size: 24rpx; color: #0076FF; font-weight: 900; display: block; margin-bottom: 10rpx; }
.speech-text { font-size: 28rpx; color: #444; line-height: 1.6; }

.act-box { display: flex; gap: 16rpx; }
.one-click-btn {
  flex: 1;
  background: rgba(0,118,255,0.1);
  color: #0076FF;
  font-size: 28rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  border: none;
  font-weight: 800;
  cursor: pointer;
}
.close-task-btn {
  background: rgba(234,67,53,0.1);
  color: #EA4335;
  font-size: 28rpx;
  padding: 20rpx 40rpx;
  border-radius: 16rpx;
  border: none;
  font-weight: 800;
  cursor: pointer;
}

.empty-state { text-align: center; padding: 80rpx 0; }
.empty-icon { font-size: 80rpx; margin-bottom: 20rpx; display: block; }
.empty-txt { color: #999; font-size: 28rpx; font-weight: 500; }

/* 弹窗 UI */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}
.modal-box {
  background: #FFF;
  width: 100%;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx;
  box-sizing: border-box;
}
.slide-up {
  animation: slideUp 0.3s ease-out forwards;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx; }
.modal-title { font-size: 34rpx; font-weight: 900; color: #222; }
.close-btn { font-size: 40rpx; color: #999; cursor: pointer; }
.form-item { margin-bottom: 30rpx; }
.form-label { font-size: 28rpx; color: #555; font-weight: bold; margin-bottom: 12rpx; display: block; }
.form-input { width: 100%; padding: 24rpx; font-size: 30rpx; box-sizing: border-box; background: #F7F8FA; border: 1px solid #EAECEA; border-radius: 16rpx; transition: border 0.3s; }
.form-input:focus { border-color: #0076FF; outline: none; background: #FFF;}
.submit-btn { width: 100%; background: linear-gradient(135deg,#0076FF,#0052CC); color: #FFF; font-size: 32rpx; font-weight: bold; padding: 28rpx; border-radius: 20rpx; border: none; margin-top: 30rpx; }
</style>
