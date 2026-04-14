<template>
  <view class="page-container">
    <view class="nav-bar">
      <view class="logo-box">📦 <text class="logo-text">WMS 库存中心</text></view>
      <button class="header-action-btn" @click="goBack">返回首页</button>
    </view>

    <view class="tabs">
      <view class="tab" :class="{active: activeTab === 'list'}" @click="activeTab='list'">库存洞察</view>
      <view class="tab" :class="{active: activeTab === 'inbound'}" @click="activeTab='inbound'">扫码入库</view>
      <view class="tab bg-blue" :class="{active: activeTab === 'ai'}" @click="activeTab='ai'">AI补货大脑</view>
    </view>

    <!-- ==== 库存洞察 ==== -->
    <view class="content-panel" v-if="activeTab==='list'">
      <view class="top-actions">
        <text class="panel-desc">共计 {{ inventories.length }} 个批次库存记录</text>
        <button class="btn-refresh" @click="fetchInventory">🔄 刷新</button>
      </view>

      <view class="table-container">
        <view class="table-header">
          <text class="th flex-2">商品名称</text>
          <text class="th">总库存量</text>
          <text class="th">保质期</text>
          <text class="th flex-action">操作</text>
        </view>
        <template v-for="group in groupedInventories" :key="group.productId">
          <!-- 主商品行 -->
          <view class="table-row" style="background:#f1f5f9; font-weight:bold;">
            <view class="td flex-2">
              <text class="p-name">{{ group.productName }}</text>
            </view>
            <view class="td">
              <text class="stock-val">{{ group.totalStock }} 件</text>
            </view>
            <view class="td">
              <text>{{ group.shelfLifeDays }}天</text>
            </view>
            <view class="td flex-action">
              <button class="btn-stocktake" @click="group.expanded = !group.expanded">
                {{ group.expanded ? '收起' : '展开批次' }}
              </button>
            </view>
          </view>
          <!-- 展开的批次明细行 -->
          <view v-if="group.expanded">
             <view class="table-row" v-for="item in group.batches" :key="item.id" style="padding-left:40rpx; border-bottom:1px dashed #eee;">
                <view class="td flex-2">
                  <text class="p-sku">批次: {{ item.batchCode }}</text>
                </view>
                <view class="td">
                  <text class="stock-val">{{ item.stock }} 件</text>
                </view>
                <view class="td">
                  <text class="expire-badge" :class="item.isWarning ? 'danger-bg' : 'safe-bg'">
                    {{ item.daysLeft > 0 ? (item.daysLeft + '天过期') : '已过期' }}
                  </text>
                </view>
                <view class="td flex-action">
                  <button class="btn-stocktake" style="background:#10b981; color:white; border:none;" @click="openStocktake(item)">盘点</button>
                </view>
             </view>
          </view>
        </template>
        <view v-if="inventories.length === 0" class="empty-state">
          <text>当前仓库空空如也，请先入库。</text>
        </view>
      </view>
    </view>

    <!-- ==== 扫码入库 ==== -->
    <view class="content-panel" v-if="activeTab==='inbound'">
      <view class="scan-header">
        <text class="panel-desc">使用红外/摄像头扫码或手动录入</text>
        <button class="btn-scan" @click="simulateScan">调用数字扫码枪</button>
      </view>
      
      <view class="form-group border-bottom">
        <text class="form-label">商品SKU码</text>
        <input class="form-input" v-model="inboundData.skuCode" placeholder="扫描条形码自动填充" />
      </view>
      <view class="form-group border-bottom">
        <text class="form-label">批次(Batch)</text>
        <input class="form-input" v-model="inboundData.batchCode" placeholder="输入溯源/批次码 (如 B2024)" />
      </view>
      <view class="form-group border-bottom">
        <text class="form-label">生产日期</text>
        <input class="form-input" type="date" v-model="inboundData.productionDate" />
      </view>
      <view class="form-group">
        <text class="form-label">入库数量</text>
        <input class="form-input" type="number" v-model="inboundData.stock" placeholder="包/罐件数" />
      </view>

      <button class="btn-submit" @click="submitInbound">立刻入库</button>
    </view>

    <!-- ==== AI智能补货 ==== -->
    <view class="content-panel" v-if="activeTab==='ai'">
      <view class="ai-header">
        <text class="ai-title">🤖 供应链助手</text>
        <text class="ai-desc">一键计算所有库存短缺，生成采销进购清单</text>
      </view>
      
      <button class="btn-ai-generate" @click="generateAdvice" :disabled="loadingAi">
        {{ loadingAi ? '正在结合大模型思考...' : '立刻生成 B2B 智能补货单' }}
      </button>

      <view class="ai-result-box" v-if="aiAdvice">
        <text class="markdown-text">{{ aiAdvice }}</text>
      </view>
    </view>

    <!-- ==== 盘点弹窗 ==== -->
    <view class="modal-overlay" v-if="showStocktakeModal">
      <view class="modal-box">
        <view class="modal-title">校准库存 - {{ curTakeItem?.product?.name }}</view>
        <text class="modal-desc">系统内数量：{{ curTakeItem?.stock }} 件，请输入当前实盘数量：</text>
        <input class="modal-input" type="number" v-model="newStockVal" />
        <view class="modal-actions">
          <button class="btn-cancel" @click="showStocktakeModal=false">取消</button>
          <button class="btn-confirm" @click="submitStocktake">确认更正</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
const activeTab = ref('list');
const inventories = ref([]);
const products = ref([]);

const groupedInventories = computed(() => {
  const map = {};
  
  // 先把所有后台商品放入 map
  products.value.forEach(p => {
    map[p.id] = {
      productId: p.id,
      productName: p.name,
      shelfLifeDays: p.shelfLifeDays || 365,
      totalStock: 0,
      expanded: false,
      batches: []
    };
  });

  // 再遍历库存批次累计
  inventories.value.forEach(item => {
    const pid = item.productId || 'unknown';
    if (!map[pid]) {
      map[pid] = {
        productId: pid,
        productName: item.product ? item.product.name : '未知产品',
        shelfLifeDays: item.product ? item.product.shelfLifeDays : 365,
        totalStock: 0,
        expanded: false,
        batches: []
      };
    }
    map[pid].totalStock += item.stock;
    map[pid].batches.push(item);
  });
  
  // 有库存批次的则默认展开
  Object.values(map).forEach(group => {
    group.expanded = group.batches.length > 0;
  });

  return Object.values(map);
});
const loadingAi = ref(false);
const aiAdvice = ref('');

const inboundData = ref({
  skuCode: '',
  batchCode: '',
  productionDate: new Date().toISOString().split('T')[0],
  stock: 12
});

const showStocktakeModal = ref(false);
const curTakeItem = ref(null);
const newStockVal = ref('');

onMounted(() => {
  fetchInventory();
  fetchProducts();
});

const fetchProducts = async () => {
  try {
    const res = await uni.request({ url: 'http://localhost:3000/admin/products', method: 'GET' });
    if (res.data) products.value = res.data;
  } catch(e) { console.error(e); }
};

const fetchInventory = async () => {
  try {
    const res = await uni.request({ url: 'http://localhost:3000/inventory', method: 'GET' });
    if (res.data) inventories.value = res.data;
  } catch(e) { console.error(e); }
};

const simulateScan = () => {
  uni.showToast({ title: '扫描成功' });
  inboundData.value.skuCode = '6901234567890';
  inboundData.value.batchCode = 'BAT-' + Math.floor(Math.random()*10000);
};

const submitInbound = async () => {
  if(!inboundData.value.skuCode || !inboundData.value.stock) {
    alert('SKU和数量不能为空'); return;
  }
  try {
    const res = await uni.request({
      url: 'http://localhost:3000/inventory/inbound',
      method: 'POST',
      data: inboundData.value
    });
    if (res.data?.success) {
      uni.showToast({ title: '入库成功' });
      inboundData.value.stock = 12; 
      inboundData.value.batchCode = '';
      activeTab.value = 'list';
      fetchInventory();
    }
  } catch(e) { console.error(e); }
};

const openStocktake = (item) => {
  curTakeItem.value = item;
  newStockVal.value = String(item.stock);
  showStocktakeModal.value = true;
};

const submitStocktake = async () => {
  try {
    const res = await uni.request({
      url: 'http://localhost:3000/inventory/stocktake',
      method: 'POST',
      data: { id: curTakeItem.value.id, actualStock: Number(newStockVal.value) }
    });
    if (res.data?.success) {
      uni.showToast({ title: '较准成功' });
      showStocktakeModal.value = false;
      fetchInventory();
    }
  } catch(e) { console.error(e); }
};

const generateAdvice = async () => {
  loadingAi.value = true;
  try {
    const res = await uni.request({ url: 'http://localhost:3000/inventory/replenish-advice', method: 'GET' });
    if(res.data?.success) aiAdvice.value = res.data.advice;
    else alert('生成失败: ' + res.data.message);
  } catch(e) { console.error(e); }
  finally { loadingAi.value = false; }
};

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
/* Neo-Brutalism / Enterprise Clean Minimalist Style */
.page-container {
  padding: 30rpx;
  background-color: #F8F9FA;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, sans-serif;
  color: #202124;
}
.nav-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30rpx; }
.logo-box { font-size: 32rpx; font-weight: 800; letter-spacing: -0.5px; }
.header-action-btn { background: transparent; color: #1A73E8; font-size: 24rpx; font-weight: 600; border: 1px solid #1A73E8; padding: 10rpx 24rpx; border-radius: 4rpx; cursor: pointer; }
.tabs { display: flex; border: 1px solid #DADCE0; border-radius: 6rpx; overflow: hidden; margin-bottom: 30rpx; background: #FFF; }
.tab { flex: 1; text-align: center; padding: 20rpx 0; font-size: 26rpx; font-weight: 600; color: #5F6368; cursor: pointer; border-right: 1px solid #DADCE0; }
.tab:last-child { border-right: none; }
.tab.active { background: #E8F0FE; color: #1A73E8; }
.tab.bg-blue.active { background: #1A73E8; color: #FFF; }
.content-panel { background: #FFF; border: 1px solid #DADCE0; border-radius: 8rpx; padding: 30rpx; }
.panel-desc { font-size: 26rpx; color: #5F6368; margin-bottom: 20rpx; display: block;}
.top-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.btn-refresh { font-size: 24rpx; background: #F8F9FA; border: 1px solid #DADCE0; padding: 10rpx 20rpx; border-radius: 4rpx; }
.table-container { width: 100%; }
.table-header { display: flex; padding-bottom: 16rpx; border-bottom: 2px solid #5F6368; margin-bottom: 16rpx; }
.th { font-size: 24rpx; font-weight: 700; color: #202124; flex: 1; text-align: left; }
.flex-2 { flex: 2; }
.flex-action { flex: 0.8; text-align: center; }
.table-row { display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1px solid #F1F3F4; }
.td { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.p-name { font-size: 26rpx; font-weight: 600; margin-bottom: 4rpx; color: #202124; }
.p-sku { font-size: 20rpx; color: #80868B; }
.stock-val { font-size: 28rpx; font-weight: 700; font-family: monospace; }
.expire-badge { font-size: 20rpx; font-weight: bold; display: inline-block; padding: 4rpx 8rpx; border-radius: 4rpx; align-self: flex-start; }
.safe-bg { background: #E6F4EA; color: #137333; }
.danger-bg { background: #FCE8E6; color: #C5221F; }
.btn-stocktake { font-size: 22rpx; background: #FFF; border: 1px solid #DADCE0; border-radius: 4rpx; padding: 8rpx; color: #202124; }
.empty-state { padding: 40rpx 0; text-align: center; color: #5F6368; font-size: 24rpx; }
.scan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx; border-bottom: 1px solid #DADCE0; padding-bottom: 20rpx; }
.btn-scan { background: #1A73E8; color: #FFF; font-size: 24rpx; padding: 12rpx 24rpx; border-radius: 4rpx; border: none; font-weight: bold; }
.form-group { display: flex; flex-direction: column; margin-bottom: 24rpx; padding-bottom: 16rpx; }
.border-bottom { border-bottom: 1px dashed #E8EAED; }
.form-label { font-size: 24rpx; font-weight: 700; color: #3C4043; margin-bottom: 10rpx; }
.form-input { padding: 16rpx; border: 1px solid #DADCE0; border-radius: 4rpx; font-size: 28rpx; background: #F8F9FA;}
.form-input:focus { background: #FFF; border-color: #1A73E8; outline: none; }
.btn-submit { background: #1A73E8; color: #FFF; font-size: 30rpx; font-weight: 700; border-radius: 4rpx; border: none; padding: 24rpx; margin-top: 20rpx; width: 100%; }
.ai-header { margin-bottom: 30rpx; }
.ai-title { font-size: 36rpx; font-weight: 800; display: block; margin-bottom: 10rpx; }
.ai-desc { font-size: 26rpx; color: #5F6368; }
.btn-ai-generate { background: #000; color: #FFF; border-radius: 4rpx; font-weight: 700; padding: 24rpx; width: 100%; border: none; margin-bottom: 30rpx; }
.btn-ai-generate[disabled] { background: #5F6368; cursor: not-allowed; }
.ai-result-box { background: #F1F3F4; padding: 30rpx; border-radius: 4rpx; border-left: 4px solid #1A73E8; }
.markdown-text { font-size: 28rpx; color: #202124; line-height: 1.6; white-space: pre-wrap; font-family: monospace; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(32,33,36,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-box { background: #FFF; width: 85%; border-radius: 8rpx; padding: 40rpx; box-shadow: 0 12px 24px rgba(0,0,0,0.2); }
.modal-title { font-size: 32rpx; font-weight: 700; color: #202124; margin-bottom: 16rpx; }
.modal-desc { font-size: 26rpx; color: #5F6368; margin-bottom: 30rpx; display: block; }
.modal-input { width: 100%; padding: 20rpx; border: 1px solid #1A73E8; border-radius: 4rpx; font-size: 32rpx; font-weight: 700; text-align: center; margin-bottom: 40rpx; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: flex-end; gap: 20rpx; }
.btn-cancel { background: transparent; border: 1px solid #DADCE0; padding: 16rpx 32rpx; font-weight: 600; border-radius: 4rpx; font-size: 26rpx;}
.btn-confirm { background: #1A73E8; color: #FFF; border: none; padding: 16rpx 32rpx; font-weight: 600; border-radius: 4rpx; font-size: 26rpx;}
</style>
