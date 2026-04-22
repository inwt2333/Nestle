<template>
  <view class="dashboard-container">
    <view class="nav-bar">
      <view class="logo-box">🍼 <text class="logo-text">雀掌柜</text></view>
      <view class="nav-actions">
        <button class="nav-btn" @click="goToToC" style="color: #4CAF50; font-weight: bold;">📱 消费者端体验</button>
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

    <!-- 核心功能卡片区 -->
    <view class="function-grid">
      <view class="func-card" @click="goToCustomers">
        <view class="icon-wrap bg-indigo">👥</view>
        <text class="func-title">客情中心</text>
        <text class="func-desc">会员档案与行为分析</text>
      </view>
      <view class="func-card" @click="goToInventory">
        <view class="icon-wrap bg-orange">📦</view>
        <text class="func-title">仓储与补货</text>
        <text class="func-desc">智能盘点与入库预测</text>
      </view>
      <view class="func-card" @click="goToTraining">
        <view class="icon-wrap bg-teal">🎓</view>
        <text class="func-title">店员培训</text>
        <text class="func-desc">学习产品知识与考核</text>
      </view>
      <view class="func-card" @click="goToAdmin">
        <view class="icon-wrap bg-slate">⚙️</view>
        <text class="func-title">管理后台</text>
        <text class="func-desc">参数配置与人员商品</text>
      </view>
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

const employeeName = ref('仔细听');
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
const goToToC = () => {
  uni.navigateTo({ url: '/pages/toc/home/index' });
};
</script>

<style scoped>
/* =========== 现代化/拟真 UI 设计 =========== */
.dashboard-container {
  padding: 27px 20px;
  background-color: #f4f7fe;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1e293b;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 27px;
  gap: 20px;
}

.logo-box {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
}

.nav-actions {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  justify-content: flex-start;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  padding-bottom: 4px;
}
.nav-actions::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.nav-btn {
  background: #ffffff;
  color: #334155;
  font-size: 16px;
  font-weight: 700;
  padding: 10px 19px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .nav-bar {
    flex-direction: column;
    align-items: stretch;
  }
}

.nav-btn:hover {
  background: #f8fafc;
  color: #2563eb;
  box-shadow: 0 6px 16px rgba(37,99,235,0.08);
}

.nav-btn:active { transform: scale(0.95); }

.header-card {
  position: relative;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  padding: 27px 27px 34px;
  border-radius: 16px;
  color: #ffffff;
  margin-bottom: 27px;
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.25);
  overflow: hidden;
}

.sweep-bg::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%);
}

.greeting .name { font-size: 27px; font-weight: 800; display: block; margin-bottom: 8px; }
.greeting .store { font-size: 18px; opacity: 0.9; font-weight: 500; }

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-top: 34px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 27px;
  backdrop-filter: blur(10px);
}

.stat-item { text-align: center; flex: 1; position: relative; }
.stat-item:not(:last-child)::after {
  content: ""; position: absolute; right: 0; top: 10%; height: 80%; width: 1px; background: rgba(255,255,255,0.2);
}

.stat-value { font-size: 26px; font-weight: 900; display: block; margin-bottom: 6px; }
.stat-label { font-size: 15px; opacity: 0.85; font-weight: 500; }

.quick-actions {
  display: flex;
  gap: 27px;
  margin-bottom: 27px;
}

.action-btn {
  flex: 1;
  padding: 20px 0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(0,0,0,0.06);
}

.action-btn:active { transform: scale(0.96); }

.recycle-bg { background: #ffffff; border: 1px solid rgba(16,185,129,0.1); }
.recycle-bg .icon { color: #10b981; font-size: 38px; margin-bottom: 8px; display: block; }
.recycle-bg .btn-text { color: #1e293b; font-weight: 700; font-size: 19px; }

.add-bg { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; }
.add-bg .icon { color: #ffffff; font-size: 38px; margin-bottom: 8px; display: block; }
.add-bg .btn-text { font-weight: 700; font-size: 19px; }

/* 功能网格区 */
.function-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 27px;
}

.func-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.03);
  transition: all 0.2s ease;
  cursor: pointer;
}

.func-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
}

.func-card:active { transform: scale(0.96); }

.icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 12px;
}
.bg-indigo { background: #e0e7ff; color: #4338ca; }
.bg-orange { background: #ffedd5; color: #c2410c; }
.bg-teal { background: #ccfbf1; color: #0f766e; }
.bg-slate { background: #f1f5f9; color: #334155; }

.func-title {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
}

.func-desc {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.4;
}

.section {
  background: #ffffff;
  border-radius: 16px;
  padding: 27px 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.02);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 27px;
}

.title { font-size: 23px; font-weight: 800; color: #0f172a; }

.badge {
  background: #fef2f2;
  color: #ef4444;
  font-size: 16px;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 700;
}

.pulse { animation: pulse 2s infinite; }
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.task-list { display: flex; flex-direction: column; gap: 27px; }

.task-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 19px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  transition: transform 0.2s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.04);
}

.task-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 27px; }
.task-title { font-size: 20px; font-weight: 800; color: #1e293b; }
.task-customer { font-size: 16px; color: #475569; font-weight: 600; padding: 4px 11px; background: #f1f5f9; border-radius: 8px; }

.ai-speech-box {
  background: #f8fafc;
  padding: 27px;
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
  margin-bottom: 27px;
}

.speech-label { font-size: 16px; color: #3b82f6; font-weight: 800; display: block; margin-bottom: 8px; }
.speech-text { font-size: 19px; color: #475569; line-height: 1.6; }

.act-box { display: flex; gap: 27px; }
.one-click-btn {
  flex: 1;
  background: #eff6ff;
  color: #2563eb;
  font-size: 19px;
  padding: 27px;
  border-radius: 10px;
  border: none;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s;
}
.one-click-btn:hover { background: #dbeafe; }
.close-task-btn {
  background: #f1f5f9;
  color: #64748b;
  font-size: 19px;
  padding: 14px 20px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.close-task-btn:hover { background: #e2e8f0; }

.empty-state { text-align: center; padding: 40px 0; }
.empty-icon { font-size: 54px; margin-bottom: 27px; display: block; }
.empty-txt { font-size: 19px; color: #94a3b8; font-weight: 600; }

/* 弹窗 UI */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-box {
  background: #ffffff;
  width: 90%;
  max-width: 320px;
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out forwards;
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
.modal-title { font-size: 16px; font-weight: 800; color: #0f172a; }
.close-btn { font-size: 20px; color: #94a3b8; cursor: pointer; }
.form-item { margin-bottom: 12px; }
.form-label { font-size: 13px; color: #475569; font-weight: 700; margin-bottom: 6px; display: block; }
.form-input { width: 100%; padding: 10px 12px; font-size: 14px; box-sizing: border-box; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; transition: border 0.3s; }
.form-input:focus { border-color: #3b82f6; outline: none; background: #FFF; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.submit-btn { width: 100%; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #FFF; font-size: 15px; font-weight: 800; padding: 12px; border-radius: 8px; border: none; margin-top: 16px; box-shadow: 0 4px 15px rgba(37,99,235,0.25); cursor: pointer; transition: transform 0.2s; }
.submit-btn:active { transform: scale(0.96); }
</style>
