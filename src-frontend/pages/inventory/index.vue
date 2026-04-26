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
              <button class="btn-stocktake" @click="toggleExpand(group.productId)">
                {{ group.expanded ? '收起' : '展开批次' }}
              </button>
            </view>
          </view>
          <!-- 展开的批次明细行 -->
          <view v-if="group.expanded">
             <view class="table-row" v-for="item in group.batches" :key="item.id" style="padding-left:27px; border-bottom:1px dashed #eee;">
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
          <text></text>
        </view>
      </view>
    </view>

    <!-- ==== 扫码入库 ==== -->
    <view class="content-panel" v-if="activeTab==='inbound'">
      <view class="scan-header">
        <text class="panel-desc">使用红外/摄像头扫码或手动录入</text>
        <button class="btn-scan" @click="simulateScan">调用数字扫码枪</button>
      </view>
      
      <view class="form-group border-bottom" style="position: relative;">
        <text class="form-label">选择商品</text>
        <view class="form-input" :style="{ color: inboundData.skuCode ? '#1e293b' : '#94a3b8', width: '100%', boxSizing: 'border-box', cursor: 'pointer' }" @click="showProductSelect = !showProductSelect">
          {{ getProductName(inboundData.skuCode) || (products.length === 0 ? '未加载到商品下拉...' : '点此选择商品...') }}
        </view>
        <!-- 自定义选择面板 -->
        <scroll-view scroll-y class="custom-dropdown" v-if="showProductSelect">
          <view class="custom-option" v-for="prod in products" :key="prod.id" @click="onOptionClick(prod)">
            <text class="opt-name">{{ prod.name }}</text>
            <text class="opt-sku">SKU: {{ prod.skuCode || prod.id }}</text>
          </view>
          <view v-if="products.length === 0" class="custom-option" style="color:#94a3b8; text-align:center;">暂无商品可选</view>
        </scroll-view>
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
const expandedCards = ref(new Set());

const toggleExpand = (productId) => {
  const newSet = new Set(expandedCards.value);
  if (newSet.has(productId)) {
    newSet.delete(productId);
  } else {
    newSet.add(productId);
  }
  expandedCards.value = newSet;
};

const groupedInventories = computed(() => {
  const map = {};
  
  // 先把所有后台商品放入 map
  products.value.forEach(p => {
    map[p.id] = {
      productId: p.id,
      productName: p.name,
      shelfLifeDays: p.shelfLifeDays || 365,
      totalStock: 0,
      expanded: expandedCards.value.has(p.id),
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
        expanded: expandedCards.value.has(pid),
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
const showProductSelect = ref(false);

const onOptionClick = (prod) => {
  inboundData.value.skuCode = prod.skuCode || prod.id;
  showProductSelect.value = false;
};

onMounted(() => {
  fetchInventory();
  fetchProducts();
});

const getProductName = (skuCode) => {
  const p = products.value.find(p => p.skuCode === skuCode || p.id === skuCode);
  return p ? p.name : '';
};

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
.page-container {
  padding: 27px;
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
  background: #ffffff;
  padding: 14px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.logo-box {
  font-size: 23px;
  font-weight: 800;
  color: #0f172a;
}

.header-action-btn {
  background: #f1f5f9;
  color: #475569;
  font-size: 18px;
  font-weight: 700;
  border: none;
  padding: 8px 19px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.header-action-btn:hover {
  background: #e2e8f0;
}

.tabs {
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 27px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  padding: 7px;
  gap: 7px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: 19px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.tab.active, .tab.bg-blue.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.content-panel {
  background: #ffffff;
  border-radius: 16px;
  padding: 27px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0,0,0,0.02);
}

.panel-desc {
  font-size: 18px;
  color: #64748b;
  margin-bottom: 27px;
  display: block;
}

.top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 27px;
}

.btn-refresh {
  font-size: 18px;
  background: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-refresh:active { transform: scale(0.96); }

.table-container { width: 100%; }

.table-header {
  display: flex;
  padding-bottom: 14px;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 27px;
}

.th {
  font-size: 18px;
  font-weight: 800;
  color: #475569;
  flex: 1;
  text-align: left;
}

.flex-2 { flex: 2; }
.flex-action { flex: 0.8; text-align: center; }

.table-row {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}

.td { flex: 1; display: flex; flex-direction: column; justify-content: center; }

.p-name { font-size: 19px; font-weight: 700; margin-bottom: 4px; color: #1e293b; }
.p-sku { font-size: 16px; color: #64748b; font-weight: 500; }
.stock-val { font-size: 20px; font-weight: 800; font-family: monospace; color: #0f172a; }

.expire-badge {
  font-size: 15px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  align-self: flex-start;
  display: inline-block;
}

.safe-bg { background: #dcfce7; color: #059669; }
.danger-bg { background: #fee2e2; color: #dc2626; }

.btn-stocktake {
  font-size: 16px;
  background: #f1f5f9;
  border: none;
  font-weight: 600;
  border-radius: 6px;
  padding: 7px 11px;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-stocktake:hover { background: #e2e8f0; }

.empty-state { padding: 40px 0; text-align: center; color: #94a3b8; font-size: 19px; font-weight: 600; }

.scan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 27px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 16px;
}

.btn-scan {
  background: #eff6ff;
  color: #2563eb;
  font-size: 18px;
  padding: 10px 19px;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

.form-group { display: flex; flex-direction: column; margin-bottom: 27px; }
.border-bottom { border-bottom: 1px solid transparent; }
.form-label { font-size: 18px; font-weight: 700; color: #475569; margin-bottom: 8px; }
.form-input {
  padding: 27px; border: 1px solid #e2e8f0; border-radius: 10px;
  font-size: 19px; background: #f8fafc; color: #1e293b;
  outline: none; transition: all 0.2s;
}
.form-input:focus { border-color: #3b82f6; background: #ffffff; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.custom-dropdown {
  position: absolute; top: calc(100% - 10px); left: 0; right: 0; z-index: 100;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
  max-height: 250px; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.custom-option {
  padding: 16px 20px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s;
  display: flex; flex-direction: column;
}
.custom-option:hover { background: #f8fafc; }
.opt-name { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
.opt-sku { font-size: 14px; color: #64748b; font-family: monospace; }

.btn-submit {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff; font-size: 20px; font-weight: 800;
  border-radius: 10px; border: none; padding: 27px;
  margin-top: 20px; width: 100%; box-shadow: 0 4px 12px rgba(37,99,235,0.25);
  cursor: pointer; transition: transform 0.2s;
}
.btn-submit:active { transform: scale(0.96); }

.ai-header { margin-bottom: 27px; }
.ai-title { font-size: 27px; font-weight: 800; display: block; margin-bottom: 8px; color: #0f172a; }
.ai-desc { font-size: 19px; color: #64748b; }

.btn-ai-generate {
  background: #0f172a; color: #ffffff;
  border-radius: 10px; font-weight: 800; font-size: 20px;
  padding: 27px; width: 100%; border: none;
  margin-bottom: 27px; box-shadow: 0 4px 15px rgba(15,23,42,0.2);
  cursor: pointer; transition: all 0.2s;
}
.btn-ai-generate[disabled] { background: #94a3b8; cursor: not-allowed; box-shadow: none; }
.btn-ai-generate:active:not([disabled]) { transform: scale(0.96); }

.ai-result-box {
  background: #f8fafc; padding: 27px; border-radius: 12px;
  border-left: 4px solid #3b82f6; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}

.markdown-text { font-size: 19px; color: #334155; line-height: 1.6; white-space: pre-wrap; font-family: monospace; }

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-box {
  background: #ffffff; width: 85%; max-width: 400px;
  border-radius: 16px; padding: 27px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}
.modal-title { font-size: 23px; font-weight: 800; color: #0f172a; margin-bottom: 27px; }
.modal-desc { font-size: 19px; color: #64748b; margin-bottom: 27px; display: block; line-height: 1.5; }
.modal-input {
  width: 100%; padding: 27px; border: 2px solid #e2e8f0;
  border-radius: 10px; font-size: 24px; font-weight: 800;
  text-align: center; margin-bottom: 27px; box-sizing: border-box; outline: none; transition: border-color 0.2s;
}
.modal-input:focus { border-color: #3b82f6; }
.modal-actions { display: flex; justify-content: flex-end; gap: 27px; }
.btn-cancel {
  background: #f1f5f9; color: #475569; border: none;
  padding: 11px 22px; font-weight: 700; border-radius: 8px; font-size: 19px; cursor: pointer;
}
.btn-confirm {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #ffffff; border: none; padding: 11px 22px;
  font-weight: 700; border-radius: 8px; font-size: 19px; cursor: pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.2);
}
</style>
