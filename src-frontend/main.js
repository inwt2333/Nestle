import { createApp } from 'vue';
import App from './App.vue';

window.uni = {
  request: async (options) => {
    try {
      const response = await fetch(options.url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.header || {})
        },
        body: options.data ? JSON.stringify(options.data) : undefined,
      });
      const data = await response.json();
      
      if (options.success) options.success({ data, statusCode: response.status });
      return { data, statusCode: response.status };
    } catch (error) {
      if (options.fail) options.fail(error);
      throw error;
    }
  },
  showToast: (opts) => {
    // 简单模拟手机toast
    console.log('[Toast] ', opts.title);
    setTimeout(() => alert(opts.title || '操作成功'), 10);
  },
  scanCode: () => {
    alert('【模拟】已成功调起浏览器摄像头扫描二维码...');
  },
  // 简易路由
  navigateTo: ({ url }) => {
    window.dispatchEvent(new CustomEvent('app-route', { detail: url }));
  },
  navigateBack: () => {
    window.dispatchEvent(new CustomEvent('app-route', { detail: '/pages/dashboard/index' }));
  },
  getStorageSync: (key) => {
    return localStorage.getItem(key);
  },
  setStorageSync: (key, value) => {
    localStorage.setItem(key, value);
  }
};

const app = createApp(App);
app.mount('#app');
