<template>
  <view class="app-wrapper">
    <Dashboard v-if="currentPath === '/pages/dashboard/index'" />
    <Customers v-if="currentPath === '/pages/customers/index'" />
    <Inventory v-if="currentPath === '/pages/inventory/index'" />
    <Training v-if="currentPath === '/pages/training/index'" />
    <Admin v-if="currentPath === '/pages/admin/index'" />
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Dashboard from './pages/dashboard/index.vue';
import Customers from './pages/customers/index.vue';
import Inventory from './pages/inventory/index.vue';
import Training from './pages/training/index.vue';
import Admin from './pages/admin/index.vue';

const currentPath = ref('/pages/dashboard/index');

const handleRouteChange = (e) => {
  currentPath.value = e.detail;
};

onMounted(() => {
  window.addEventListener('app-route', handleRouteChange);
  
  // 注入到uni全局以供调用
  window.uni.navigateTo = ({ url }) => {
    currentPath.value = url;
  };
  window.uni.navigateBack = () => {
    currentPath.value = '/pages/dashboard/index';
  };
});

onUnmounted(() => {
  window.removeEventListener('app-route', handleRouteChange);
});
</script>

<style>
/* 模拟小程序基础组件样式，让 Web 能够原汁原味渲染 <view> 和 <text> */
body {
  margin: 0;
  padding: 0;
  background-color: #F5F7FA;
  -webkit-font-smoothing: antialiased;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.8;
}
view {
  display: block;
  box-sizing: border-box;
}
text {
  display: inline;
  box-sizing: border-box;
  line-height: 1.8;
}
input, textarea, button {
  font-family: inherit;
  box-sizing: border-box;
}
.btn, button {
  padding: 12px 24px !important;
}
.input, input, textarea {
  padding: 14px 22px !important;
}


/* ========================================= */
/*       全局注入：增大卡片/控件与边缘的距离     */
/* ========================================= */

.card, .customer-card, .article-card, .assess-card, .dashboard-card {
  margin-bottom: 27px !important;
  padding: 32px !important;
  border-radius: 11px !important;
}

.customers-container, .dashboard-container, .inventory-container, .training-container, .admin-container, .content {
  padding: 40px 32px 54px 32px !important;
}

.input, input, textarea, .f-input, select, .custom-select, .input-line {
  margin-bottom: 24px !important;
  padding: 19px 27px !important;
  border-radius: 11px !important;
}

.f-row {
  margin-bottom: 27px !important;
}

.action-bar, .actions, .sub-tabs, .tabs {
  margin-bottom: 32px !important;
}

</style>

