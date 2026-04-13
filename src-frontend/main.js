import { createApp } from 'vue';
import App from './App.vue';

// 注入模拟的小程序全局 API，让写给 uni-app 的代码在 Chrome 浏览器里也能跑通
window.uni = {
  request: async (options) => {
    try {
      const response = await fetch(options.url, {
        method: options.method || 'GET',
        headers: options.header || {},
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
    alert(opts.title || '操作成功');
  },
  scanCode: () => {
    alert('【模拟】已成功调起浏览器摄像头扫描二维码...');
  }
};

const app = createApp(App);
app.mount('#app');
