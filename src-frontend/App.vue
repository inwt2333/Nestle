<template>
  <view class="app-wrapper">
    <Dashboard v-if="currentPath === '/pages/dashboard/index'" />
    <Customers v-if="currentPath === '/pages/customers/index'" />
    <Inventory v-if="currentPath === '/pages/inventory/index'" />
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Dashboard from './pages/dashboard/index.vue';
import Customers from './pages/customers/index.vue';
import Inventory from './pages/inventory/index.vue';

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
}
view {
  display: block;
  box-sizing: border-box;
}
text {
  display: inline;
  box-sizing: border-box;
}
</style>
