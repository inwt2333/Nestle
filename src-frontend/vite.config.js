import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 配置 Vite 把咱们写的 "view" 和 "text" 等非标标签，当作合法的 Vue 自定义元素编译
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['view', 'text', 'image', 'scroll-view'].includes(tag),
        },
      },
    }),
  ],
  server: {
    port: 5173,
    open: true, // 启动时在电脑自动打开浏览器
  },
});
