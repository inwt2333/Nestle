<template>
  <div>
    <App />
  </div>
</template>

<script setup>
import App from './pages/dashboard/index.vue';
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
