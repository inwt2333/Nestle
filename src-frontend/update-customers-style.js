const fs = require('fs');
const file = 'pages/customers/index.vue';
let content = fs.readFileSync(file, 'utf8');

const newStyle = `
<style scoped>
/* Enterprise Minimalist Data-Heavy Style */
.customers-container {
  padding: 30rpx;
  background: #F8F9FA;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #202124;
}

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx; border-bottom: 2px solid #202124; padding-bottom: 20rpx; }
.title { font-size: 36rpx; font-weight: 800; color: #202124; }
.back-btn { font-size: 24rpx; color: #1A73E8; background: transparent; border: 1px solid #1A73E8; padding: 10rpx 24rpx; border-radius: 4rpx; font-weight: 600; cursor: pointer; }

.customer-list { display: flex; flex-direction: column; gap: 20rpx; }

.customer-card { background: #FFF; border: 1px solid #DADCE0; border-radius: 8rpx; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

.card-header { display: flex; align-items: center; padding: 30rpx; cursor: pointer; background: #FFF; }
.avatar-wrap { width: 80rpx; height: 80rpx; border-radius: 4rpx; background: #1A73E8; color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 36rpx; font-weight: 800; margin-right: 24rpx; }
.head-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.c-name { font-size: 32rpx; font-weight: 700; color: #202124; margin-bottom: 8rpx; }
.c-sub { font-size: 24rpx; color: #5F6368; font-weight: 500; }
.expand-icon { font-size: 24rpx; color: #5F6368; font-weight: 800; }

.card-content { padding: 0 30rpx 30rpx; background: #F8F9FA; border-top: 1px dashed #DADCE0; margin-top: 10rpx; padding-top: 30rpx; }

.divider { display: none; } /* removed originally */

.info-row { display: flex; align-items: center; margin-bottom: 20rpx; }
.label { width: 140rpx; font-size: 24rpx; font-weight: 700; color: #3C4043; }
.value.input { flex: 1; padding: 16rpx; border: 1px solid #DADCE0; border-radius: 4rpx; font-size: 28rpx; background: #FFF; }

.ai-status { display: flex; align-items: center; margin: 30rpx 0; padding: 24rpx; background: #F1F3F4; border-left: 4px solid #1A73E8; border-radius: 0 4rpx 4rpx 0; }
.icon { font-size: 32rpx; margin-right: 16rpx; filter: grayscale(1); }
.status-text { font-size: 26rpx; color: #3C4043; font-family: monospace; font-weight: 600; }

.actions { display: flex; justify-content: flex-end; gap: 20rpx; margin-top: 30rpx; }
.btn { padding: 16rpx 32rpx; border-radius: 4rpx; font-size: 26rpx; font-weight: 700; cursor: pointer; border: none; }
.del-btn { background: #FCE8E6; color: #C5221F; border: 1px solid #FAD2CF; }
.save-btn { background: #202124; color: #FFF; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }

.empty { text-align: center; padding: 100rpx 0; color: #5F6368; font-size: 28rpx; font-weight: 600; border: 1px dashed #DADCE0; margin-top: 40rpx; border-radius: 8rpx; background: #FFF; }
</style>
`;
content = content.replace(/<style scoped>[\s\S]*<\/style>/, newStyle.trim());
fs.writeFileSync(file, content);
