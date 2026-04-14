<template>
  <view class="customers-container">
    <view class="header">
      <text class="title">客情中心 ({{ filteredCustomers.length }}人)</text>
      <button class="back-btn" @click="goBack">返回</button>
    </view>

    <!-- 标签筛选与分类 -->
    <view class="filter-section">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input class="search-input" v-model="searchQuery" placeholder="搜索顾客姓名 / 手机号 / 宝宝昵称..." />
      </view>
      <scroll-view scroll-x class="tags-scroll">
        <view class="tag-pill" :class="{ active: activeTag === '全部' }" @click="activeTag = '全部'">全部分类</view>
        <view class="tag-pill" :class="{ active: activeTag === '新客' }" @click="activeTag = '新客'">📌 新客</view>
        <view class="tag-pill" :class="{ active: activeTag === '核心老客' }" @click="activeTag = '核心老客'">💎 核心老客</view>
        <view class="tag-pill" :class="{ active: activeTag === '过敏体质' }" @click="activeTag = '过敏体质'">⚠️ 过敏体质</view>
        <view class="tag-pill" :class="{ active: activeTag === '临近生日' }" @click="activeTag = '临近生日'">🎂 临近生日</view>
      </scroll-view>
    </view>

    <view class="customer-list">
      <view class="customer-card" v-for="(customer, index) in filteredCustomers" :key="customer.id">
        <!-- 卡片头部 (总览) -->
        <view class="card-header" @click="toggleExpand(customer.id)">
          <view class="avatar-wrap">
            <text class="avatar">{{ customer.nickname ? customer.nickname.charAt(0) : "客" }}</text>
          </view>
          <view class="head-info">
            <view class="name-row">
              <text class="c-name">{{ customer.nickname || "未命名顾客" }}</text>
              <view class="tags-display">
                <text class="mini-tag" v-for="(tag, tid) in (customer.tags ? customer.tags.split(',') : [])" :key="tid" v-show="tag">{{ tag }}</text>
              </view>
            </view>
            <text class="c-sub">👶 {{ getBabyProfile(customer).name || "未填写宝宝" }} | 🍼 {{ getBabyProfile(customer).feedingType || "未知喂养" }}</text>
          </view>
          <view class="level-badge">LV.{{ customer.memberLevel || 1 }}</view>
          <view class="expand-icon">{{ expanded[customer.id] ? "▲" : "▼" }}</view>
        </view>

        <!-- 卡片详细内容 (折叠/展开区域) -->
        <view class="card-content" v-if="expanded[customer.id]">
          
          <!-- 切换Tab: 档案、积分、购买记录 -->
          <view class="inner-tabs">
            <text class="inner-tab" :class="{ active: activeSubTab[customer.id] === 'profile' || !activeSubTab[customer.id] }" @click="setSubTab(customer.id, 'profile')">基本档案</text>
            <text class="inner-tab" :class="{ active: activeSubTab[customer.id] === 'points' }" @click="setSubTab(customer.id, 'points')">积分/等级</text>
            <text class="inner-tab" :class="{ active: activeSubTab[customer.id] === 'orders' }" @click="setSubTab(customer.id, 'orders')">购买记录</text>
          </view>

          <!-- 档案TAB -->
          <view v-if="activeSubTab[customer.id] === 'profile' || !activeSubTab[customer.id]">
            <view class="info-row"><text class="label">顾客称呼:</text><input class="value input" v-model="customer.nickname" /></view>
            <view class="info-row"><text class="label">手机号码:</text><input class="value input" v-model="customer.phone" /></view>
            <view class="info-row"><text class="label">客户标签:</text><input class="value input" v-model="customer.tags" placeholder="逗号分隔,如: 新客,过敏体质"/></view>
            <view class="info-row"><text class="label">宝宝昵称:</text><input class="value input" v-model="customer.babyProfiles[0].name" /></view>
            <view class="info-row"><text class="label">出生日期:</text><input class="value input" type="date" :value="formatDate(customer.babyProfiles[0].birthDate, 'YYYY-MM-DD')" @input="(e) => customer.babyProfiles[0].birthDate = e.detail.value" /></view>
            <view class="info-row"><text class="label">喂养方式:</text><input class="value input" v-model="customer.babyProfiles[0].feedingType" placeholder="母乳/混合/配方奶"/></view>
            <view class="info-row"><text class="label">过敏史:</text><input class="value input" v-model="customer.babyProfiles[0].allergyInfo" /></view>
          </view>

          <!-- 积分/等级TAB -->
          <view v-if="activeSubTab[customer.id] === 'points'">
            <view class="points-grid">
              <view class="points-card">
                <text class="p-title">会员等级</text>
                <input class="p-val-input" type="number" v-model="customer.memberLevel" />
              </view>
              <view class="points-card">
                <text class="p-title">消费积分</text>
                <input class="p-val-input" type="number" v-model="customer.points" />
              </view>
              <view class="points-card">
                <text class="p-title">环保回收积分</text>
                <input class="p-val-input" type="number" v-model="customer.recyclePoints" />
              </view>
            </view>
            <button class="gift-btn" @click="openRedeemModal(customer)">🎁 兑换积分礼品/券</button>
          </view>

          <!-- 购买记录TAB -->
          <view v-if="activeSubTab[customer.id] === 'orders'">
            <view v-if="customer.orders && customer.orders.length > 0" class="order-list">
              <view class="order-item" v-for="order in customer.orders" :key="order.id">
                <view class="order-top">
                  <text class="order-date">{{ formatDate(order.createdAt, 'YYYY-MM-DD HH:mm') }}</text>
                  <text class="order-price">¥{{ order.totalAmount }}</text>
                </view>
                <view class="order-products" v-for="item in order.items" :key="item.id">
                  {{ item.product.name }} x {{ item.quantity }}
                </view>
              </view>
            </view>
            <view v-else class="empty-orders">暂无购买记录</view>
          </view>

          <!-- 生日/阶段关怀 AI提示框 -->
          <view class="ai-status">
            <view class="reminder-icons">
              <text class="icon tip-icon">🤖</text>
              <text class="icon tip-icon" v-if="checkIsBirthdayNear(customer)">🎂</text>
            </view>
            <view class="status-content">
              <text class="status-text">{{ getCareReminderText(customer) }}</text>
              <text class="status-subtext">{{ getLastTaskStatus(customer) }}</text>
            </view>
            <button class="ai-gen-btn" @click="generateAdvice(customer)">AI话术</button>
          </view>

          <view class="actions">
            <button class="btn buy-btn" @click="openPurchaseModal(customer)">🛍️ 开单购买</button>
            <button class="btn del-btn" @click="removeCustomer(customer.id)">删除档</button>
            <button class="btn save-btn" @click="saveCustomer(customer)">保存修改</button>
          </view>
        </view>
      </view>

      <view v-if="filteredCustomers.length === 0" class="empty">
        <text>未找到符合条件的顾客数据</text>
      </view>
    </view>

    <!-- 弹窗：录入购买 -->
    <view class="modal-overlay" v-if="showPurchaseModal">
      <view class="modal-box">
        <view class="modal-header">
          <text class="title">为 {{ currentCustomer.nickname }} 录入购买</text>
          <button class="close-btn" @click="closePurchaseModal">X</button>
        </view>
        <view class="modal-content">
          <view class="info-row">
            <text class="label">选择商品:</text>
            <select class="value custom-select" v-model="purchaseForm.productId">
              <option disabled value="">请选择产品 (库存从最大批次扣除)</option>
              <option v-for="inv in inventories" :key="inv.product.id" :value="inv.product.id">
                {{ inv.product.name }} (可用库存: {{ inv.stock }}) - ¥299
              </option>
            </select>
          </view>
          <view class="info-row">
            <text class="label">购买数量:</text>
            <input type="number" class="value input" v-model="purchaseForm.quantity" />
          </view>
          <text class="hint-text">开单后将自动抵扣库存、生成客情购买记录，并更新门店销售额和积分！</text>
          <button class="buy-submit-btn" @click="submitPurchase">💳 确认开单 (¥{{ (purchaseForm.quantity * 299).toFixed(2) }})</button>
        </view>
      </view>
    </view>

    <!-- 弹窗：积分兑换 -->
    <view class="modal-overlay" v-if="showRedeemModal">
      <view class="modal-box">
        <view class="modal-header">
          <text class="title">为 {{ currentCustomer.nickname }} 兑换</text>
          <button class="close-btn" @click="closeRedeemModal">X</button>
        </view>
        <view class="modal-content">
          <view class="info-row">
            <text class="label">可用消费积分:</text>
            <text class="value">{{ currentCustomer.points }} 分</text>
          </view>
          <view class="info-row">
            <text class="label">可用回收积分:</text>
            <text class="value">{{ currentCustomer.recyclePoints }} 分</text>
          </view>
          
          <view class="info-row">
            <text class="label">选择礼品:</text>
            <select class="value custom-select" v-model="redeemForm.selectedOption">
              <option disabled value="">请选择礼品</option>
              <optgroup label="消费积分专区">
                <option v-for="g in gifts.filter(g => g.redeemType === 'CONSUMER')" :key="g.id" :value="'points-' + g.pointsRequired + '-' + g.name">
                  {{ g.name }} (消耗{{ g.pointsRequired }}消费积分)
                </option>
              </optgroup>
              <optgroup label="环保积分专区">
                <option v-for="g in gifts.filter(g => g.redeemType === 'RECYCLE')" :key="g.id" :value="'recyclePoints-' + g.pointsRequired + '-' + g.name">
                  {{ g.name }} (消耗{{ g.pointsRequired }}环保积分)
                </option>
              </optgroup>
            </select>
          </view>

          <text class="hint-text">立即核销店面奖品或自动派发电子抵扣券到顾客微信</text>
          <button class="buy-submit-btn" @click="submitRedeem">🎁 确认兑换</button>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const customers = ref([]);
const expanded = ref({});
const activeSubTab = ref({});
const activeTag = ref('全部');
const searchQuery = ref('');

// 录入购买相关
const showPurchaseModal = ref(false);
const currentCustomer = ref(null);
const inventories = ref([]);
const purchaseForm = ref({ productId: '', quantity: 1 });

// 积分兑换相关
const showRedeemModal = ref(false);
const redeemForm = ref({ selectedOption: '' });
const gifts = ref([]);

const fetchGifts = async () => {
  try {
    const res = await uni.request({ url: "http://localhost:3000/admin/gifts", method: "GET" });
    if (res.data) gifts.value = res.data;
  } catch(e) {}
};

const fetchCustomers = async () => {
  try {
    const res = await uni.request({
      url: "http://localhost:3000/business/customers",
      method: "GET",
    });
    if (res.data && Array.isArray(res.data)) {
      customers.value = res.data.map((c) => {
        if (!c.babyProfiles || c.babyProfiles.length === 0) c.babyProfiles = [{}];
        return c;
      });
    }
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchCustomers();
  fetchGifts();
});

// 计算属性：搜索与标签过滤
const filteredCustomers = computed(() => {
  return customers.value.filter(c => {
    // 搜索过滤
    const q = searchQuery.value.toLowerCase();
    const babyName = (c.babyProfiles[0]?.name || '').toLowerCase();
    const matchSearch = !q || (c.nickname||'').toLowerCase().includes(q) || (c.phone||'').includes(q) || babyName.includes(q);
    
    // 标签分类过滤
    let matchTag = true;
    if (activeTag.value !== '全部') {
      const tags = (c.tags || '').split(',');
      if (activeTag.value === '临近生日') {
        matchTag = checkIsBirthdayNear(c);
      } else if (activeTag.value === '核心老客') {
        matchTag = c.memberLevel >= 3 || tags.includes('核心老客');
      } else if (activeTag.value === '过敏体质') {
        const alg = c.babyProfiles[0]?.allergyInfo || '';
        matchTag = tags.includes('过敏') || tags.includes('过敏体质') || (alg && alg !== '无');
      } else {
        matchTag = tags.includes(activeTag.value);
      }
    }
    
    return matchSearch && matchTag;
  });
});

const toggleExpand = (id) => expanded.value[id] = !expanded.value[id];
const setSubTab = (id, tabName) => activeSubTab.value[id] = tabName;

const getBabyProfile = (c) => c.babyProfiles?.[0] || {};
const updateBabyProfile = (c, key, value) => c.babyProfiles[0][key] = value;

const formatDate = (dateStr, format = "zh") => {
  if (!dateStr) return "未设置";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  if (format === "YYYY-MM-DD") return `${y}-${m}-${day}`;
  return `${y}年${m}月${day}日`;
};

// 判断是否最近30天生日
const checkIsBirthdayNear = (c) => {
  const d = new Date(c.babyProfiles[0]?.birthDate);
  if(isNaN(d)) return false;
  const today = new Date();
  d.setFullYear(today.getFullYear());
  const diffDays = (d.getTime() - today.getTime()) / (1000*3600*24);
  return diffDays >= 0 && diffDays <= 30; // 未来30天内过生日
};

// 获取关怀提醒主文案
const getCareReminderText = (c) => {
  if(checkIsBirthdayNear(c)) return '系统提醒：宝宝本月即将过生日，请及时送上关怀贺卡及生日礼券！';
  const ageMonths = Math.floor((Date.now() - new Date(c.babyProfiles[0]?.birthDate).getTime())/(1000*3600*24*30));
  if(ageMonths === 6) return '阶段提醒：宝宝满6月龄，该添加辅食和转2段配方粉啦。';
  if(ageMonths === 12) return '阶段提醒：宝宝满周岁咯，可提醒转3段产品及早教互动。';
  return '阶段关怀：定期联系客户，维系客情。';
};

const getLastTaskStatus = (c) => {
  if (!c.employeeTasks || c.employeeTasks.length === 0) return "未发现最近的 AI 发送记录";
  const days = Math.floor((Date.now() - new Date(c.employeeTasks[0].createdAt).getTime()) / (1000*3600*24));
  return `上次发关怀：${days===0 ? '今天' : days+'天前'} (${c.employeeTasks[0].title})`;
};

const saveCustomer = async (c) => {
  try {
    const baby = c.babyProfiles[0] || {};
    let bd = new Date().toISOString();
    if (baby.birthDate) bd = baby.birthDate.includes("T") ? baby.birthDate : new Date(baby.birthDate).toISOString();

    await uni.request({
      url: `http://localhost:3000/business/customer/${c.id}`,
      method: "PUT",
      data: {
        nickname: c.nickname,
        phone: c.phone,
        tags: c.tags || '',
        memberLevel: c.memberLevel || 1,
        points: c.points || 0,
        recyclePoints: c.recyclePoints || 0,
        babyName: baby.name || "未命名",
        birthDate: bd,
        allergyInfo: baby.allergyInfo || "无",
        feedingType: baby.feedingType || "未知",
      },
    });
    uni.showToast({ title: "保存成功", icon: "none" });
    fetchCustomers();
  } catch (e) {
    alert("保存失败: " + String(e));
  }
};

const simulateGift = (c) => {
  uni.showToast({ title: '已抵扣积分并向顾客微信派发神券🎁'});
};

const removeCustomer = async (id) => {
  if (!window.confirm("确认删除？(包括订单及积分)")) return;
  try {
    await uni.request({ url: `http://localhost:3000/business/customer/${id}`, method: "DELETE" });
    uni.showToast({ title: "已删除", icon: "none" });
    fetchCustomers();
  } catch (e) { alert("删除失败"); }
};

const generateAdvice = async (c) => {
  alert('【能力演示】 AI 连带话术计算中... (此按钮仅做演示联动，实际需调用业务接口)');
};

// 购买弹窗相关功能
const fetchInventories = async () => {
  try {
    const res = await uni.request({ url: "http://localhost:3000/inventory", method: "GET" });
    if (res.data && Array.isArray(res.data)) {
      inventories.value = res.data;
    }
  } catch (e) {}
};

const openPurchaseModal = async (c) => {
  currentCustomer.value = c;
  showPurchaseModal.value = true;
  purchaseForm.value = { productId: '', quantity: 1 };
  await fetchInventories();
};

const closePurchaseModal = () => {
  showPurchaseModal.value = false;
  currentCustomer.value = null;
};

const submitPurchase = async () => {
  if (!purchaseForm.value.productId) { alert('请下拉选择商品'); return; }
  if (purchaseForm.value.quantity <= 0) { alert('购买数量必须大于0'); return; }

  try {
    await uni.request({
      url: "http://localhost:3000/business/order",
      method: "POST",
      data: {
        customerId: currentCustomer.value.id,
        productId: purchaseForm.value.productId,
        quantity: Number(purchaseForm.value.quantity)
      }
    });
    uni.showToast({ title: "开单并在后台自动更新积分与门店库存", icon: "none" });
    closePurchaseModal();
    fetchCustomers(); // 刷新获取新销售记录
  } catch (e) {
    alert("开单失败: " + String(e));
  }
};

const goBack = () => uni.navigateBack();

// 弹窗兑换功能
const openRedeemModal = (c) => {
  currentCustomer.value = c;
  showRedeemModal.value = true;
  redeemForm.value = { selectedOption: '' };
};

const closeRedeemModal = () => {
  showRedeemModal.value = false;
  currentCustomer.value = null;
};

const submitRedeem = async () => {
  if (!redeemForm.value.selectedOption) { 
    alert('请选择一个兑换礼品'); 
    return; 
  }
  const [pointType, pointsStr, giftName] = redeemForm.value.selectedOption.split('-');
  const pointsToDeduct = Number(pointsStr);
  
  if (pointType === 'points' && currentCustomer.value.points < pointsToDeduct) {
    alert(`消费积分不足，需要 ${pointsToDeduct} 分`); return;
  }
  if (pointType === 'recyclePoints' && currentCustomer.value.recyclePoints < pointsToDeduct) {
    alert(`环保回收积分不足，需要 ${pointsToDeduct} 分`); return;
  }

  try {
    const res = await uni.request({
      url: "http://localhost:3000/business/redeem",
      method: "POST",
      data: {
        customerId: currentCustomer.value.id,
        pointType,
        pointsToDeduct,
        giftName
      }
    });

    if (res.data?.success) {
       uni.showToast({ title: res.data.message, icon: "none", duration: 3000 });
       alert(res.data.message); // 让用户能看清楚
       closeRedeemModal();
       fetchCustomers(); // 原地刷新积分数据
    } else {
       alert(res.data?.message || '兑换失败');
    }
  } catch (e) {
    alert('请求失败: ' + String(e));
  }
};
</script>

<style scoped>
.customers-container {
  padding: 30rpx;
  background: #F8F9FA;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, sans-serif;
  color: #202124;
}

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30rpx; border-bottom: 2px solid #202124; padding-bottom: 20rpx; }
.title { font-size: 36rpx; font-weight: 800; color: #202124; }
.back-btn { font-size: 24rpx; color: #1A73E8; background: transparent; border: 1px solid #1A73E8; padding: 10rpx 24rpx; border-radius: 4rpx; font-weight: 600; cursor: pointer; }

/* 搜索与分类区 */
.filter-section { margin-bottom: 30rpx; }
.search-box { display: flex; align-items: center; background: #FFF; border: 1px solid #DADCE0; border-radius: 6rpx; padding: 16rpx 20rpx; margin-bottom: 20rpx; }
.search-icon { margin-right: 16rpx; font-size: 28rpx; }
.search-input { flex: 1; font-size: 26rpx; background: transparent; border: none; outline: none; }
.tags-scroll { white-space: nowrap; overflow-x: auto; padding-bottom: 10rpx; }
.tag-pill { display: inline-block; padding: 12rpx 24rpx; background: #FFF; border: 1px solid #DADCE0; font-size: 24rpx; color: #5F6368; border-radius: 40rpx; margin-right: 16rpx; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.tag-pill.active { background: #202124; color: #FFF; border-color: #202124; }

.customer-list { display: flex; flex-direction: column; gap: 20rpx; }
.customer-card { background: #FFF; border: 1px solid #DADCE0; border-radius: 8rpx; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

/* Card Header */
.card-header { display: flex; align-items: center; padding: 30rpx; cursor: pointer; }
.avatar-wrap { position: relative; margin-right: 24rpx; }
.avatar { width: 88rpx; height: 88rpx; border-radius: 8rpx; background: #1A73E8; color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 36rpx; font-weight: 800; }
.level-badge { background: #FFD700; color: #8B4500; font-size: 20rpx; font-weight: 900; padding: 6rpx 12rpx; border-radius: 6rpx; margin-right: 16rpx; display: inline-block; flex-shrink: 0; box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3); }
.head-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.name-row { display: flex; align-items: center; margin-bottom: 8rpx; }
.c-name { font-size: 32rpx; font-weight: 700; color: #202124; margin-right: 16rpx; }
.tags-display { display: flex; gap: 8rpx; flex-wrap: wrap; }
.mini-tag { font-size: 18rpx; background: #E8F0FE; color: #1A73E8; padding: 4rpx 10rpx; border-radius: 4rpx; font-weight: 700; }
.c-sub { font-size: 24rpx; color: #5F6368; font-weight: 500; }
.expand-icon { font-size: 24rpx; color: #5F6368; font-weight: 800; }

/* Card Content / Tabs */
.card-content { padding: 0 30rpx 30rpx; background: #FAFAFA; border-top: 1px dashed #DADCE0; }
.inner-tabs { display: flex; border-bottom: 2px solid #E8EAED; margin-bottom: 20rpx; }
.inner-tab { padding: 20rpx 30rpx; font-size: 26rpx; font-weight: 600; color: #5F6368; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; }
.inner-tab.active { color: #1A73E8; border-bottom-color: #1A73E8; }

/* Info Rows & Forms */
.info-row { display: flex; align-items: center; margin-bottom: 16rpx; }
.label { width: 140rpx; font-size: 24rpx; font-weight: 700; color: #3C4043; }
.value.input { flex: 1; padding: 14rpx; border: 1px solid #DADCE0; border-radius: 4rpx; font-size: 26rpx; background: #FFF; }

/* Points Grid */
.points-grid { display: flex; gap: 16rpx; margin-bottom: 20rpx; }
.points-card { flex: 1; background: #FFF; border: 1px solid #DADCE0; padding: 20rpx; border-radius: 6rpx; text-align: center; }
.p-title { font-size: 22rpx; color: #5F6368; display: block; margin-bottom: 10rpx; }
.p-val-input { width: 100%; font-size: 32rpx; font-weight: 800; color: #202124; text-align: center; background: #F8F9FA; border: 1px dashed #DADCE0; padding: 8rpx 0; }
.gift-btn { background: #34A853; color: #FFF; border: none; padding: 20rpx; border-radius: 4rpx; font-weight: 700; font-size: 26rpx; margin-top: 10rpx; }

/* Orders Tab */
.order-list { display: flex; flex-direction: column; gap: 16rpx; }
.order-item { background: #FFF; border: 1px solid #E8EAED; padding: 20rpx; border-radius: 6rpx; border-left: 4px solid #FABB05; }
.order-top { display: flex; justify-content: space-between; margin-bottom: 12rpx; border-bottom: 1px dashed #F1F3F4; padding-bottom: 8rpx; }
.order-date { font-size: 22rpx; color: #5F6368; }
.order-price { font-size: 26rpx; font-weight: 800; color: #202124; }
.order-products { font-size: 24rpx; color: #3C4043; }
.empty-orders { padding: 40rpx; text-align: center; color: #80868B; font-size: 24rpx; }

/* AI Status / Care */
.ai-status { display: flex; align-items: center; margin: 30rpx 0 20rpx; padding: 20rpx; background: #FDE293; border: 1px solid #F9AB00; border-radius: 6rpx; }
.reminder-icons { display: flex; flex-direction: column; margin-right: 20rpx; gap: 8rpx; }
.tip-icon { font-size: 32rpx; }
.status-content { flex: 1; }
.status-text { font-size: 26rpx; color: #202124; font-weight: 800; display: block; margin-bottom: 4rpx; }
.status-subtext { font-size: 22rpx; color: #5F6368; }
.ai-gen-btn { background: #000; color: #FFF; font-size: 22rpx; padding: 10rpx 20rpx; border-radius: 4rpx; border: none; font-weight: 700; flex-shrink: 0; }

.actions { display: flex; justify-content: flex-end; gap: 20rpx; margin-top: 30rpx; border-top: 1px dashed #DADCE0; padding-top: 20rpx; }
.btn { padding: 16rpx 32rpx; border-radius: 4rpx; font-size: 26rpx; font-weight: 700; cursor: pointer; border: none; }
.buy-btn { background: #34A853; color: #FFF; margin-right: auto; }
.del-btn { background: transparent; color: #C5221F; border: 1px solid #FAD2CF; }
.save-btn { background: #202124; color: #FFF; }

.empty { text-align: center; padding: 100rpx 0; color: #5F6368; font-size: 28rpx; font-weight: 600; border: 1px dashed #DADCE0; margin-top: 40rpx; border-radius: 8rpx; background: #FFF; }

/* 购买开单弹窗 */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 100; }
.modal-box { background: #FFF; border-radius: 8rpx; width: 680rpx; max-width: 90vw; padding: 40rpx; }
.modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #202124; padding-bottom: 16rpx; margin-bottom: 30rpx; }
.modal-header .title { font-size: 32rpx; font-weight: 800; color: #202124; }
.close-btn { background: transparent; border: none; font-size: 36rpx; font-weight: bold; color: #5F6368; cursor: pointer; }
.custom-select { width: 100%; padding: 16rpx; border: 1px solid #DADCE0; border-radius: 4rpx; font-size: 26rpx; background: #FFF; height: 75rpx; }
.hint-text { font-size: 22rpx; color: #1A73E8; margin: 20rpx 0; display: block; font-weight: 600; }
.buy-submit-btn { width: 100%; background: #202124; color: #FFF; border: none; padding: 24rpx; border-radius: 4rpx; font-weight: 800; margin-top: 20rpx; cursor: pointer; }
</style>
