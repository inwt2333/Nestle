const fs = require('fs');
const file = 'src-frontend/pages/dashboard/index.vue';
let content = fs.readFileSync(file, 'utf8');

const newStyle = `
<style scoped>
/* Enterprise B2B Minimalist Style (Neo-Brutalism & Clean White) */
.dashboard-container {
  padding: 30rpx;
  background-color: #F8F9FA;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #202124;
}

.nav-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx; border-bottom: 2px solid #5F6368; padding-bottom: 20rpx; }
.logo-box { font-size: 32rpx; font-weight: 800; color: #202124; letter-spacing: -0.5px; }
.nav-actions { display: flex; gap: 16rpx; }
.nav-btn { background: #FFF; border: 1px solid #DADCE0; color: #202124; font-size: 24rpx; font-weight: 600; padding: 10rpx 20rpx; border-radius: 4rpx; cursor: pointer; }
.nav-btn:active { background: #F1F3F4; }

.header-card {
  background: #FFF;
  border: 1px solid #DADCE0;
  border-radius: 8rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
}
.greeting .name { font-size: 40rpx; font-weight: 800; display: block; margin-bottom: 8rpx; color: #202124; }
.greeting .store { font-size: 26rpx; color: #5F6368; font-weight: 500; display: block; }
.stats-row { display: flex; justify-content: space-between; margin-top: 40rpx; padding-top: 30rpx; border-top: 1px solid #F1F3F4; }
.stat-item { flex: 1; display: flex; flex-direction: column; }
.stat-value { font-size: 36rpx; font-weight: 800; color: #202124; font-family: monospace; }
.stat-label { font-size: 24rpx; color: #5F6368; }

.quick-actions { display: flex; gap: 20rpx; margin-bottom: 40rpx; }
.action-btn { flex: 1; padding: 30rpx 0; border-radius: 8rpx; display: flex; flex-direction: column; align-items: center; border: 1px solid #DADCE0; background: #FFF; cursor: pointer; }
.recycle-bg .icon, .add-bg .icon { font-size: 48rpx; margin-bottom: 12rpx; display: block; filter: grayscale(1); }
.btn-text { font-weight: 700; font-size: 26rpx; color: #202124; }

.section { background: #FFF; border: 1px solid #DADCE0; border-radius: 8rpx; padding: 30rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30rpx; border-bottom: 1px dashed #E8EAED; padding-bottom: 20rpx; }
.title { font-size: 32rpx; font-weight: 800; color: #202124; }
.badge { background: #202124; color: #FFF; font-size: 24rpx; padding: 6rpx 16rpx; border-radius: 4rpx; font-weight: 700; }

.task-list { display: flex; flex-direction: column; gap: 20rpx; }
.task-card { background: #F8F9FA; border: 1px solid #DADCE0; border-radius: 6rpx; padding: 24rpx; border-left: 4px solid #1A73E8; }
.task-head { display: flex; justify-content: space-between; margin-bottom: 12rpx; align-items: center; }
.task-title { font-size: 28rpx; font-weight: 700; color: #202124; }
.task-customer { font-size: 22rpx; color: #5F6368; background: #E8EAED; padding: 4rpx 12rpx; border-radius: 4rpx; font-weight: 600; }
.ai-speech-box { background: #FFF; padding: 20rpx; border: 1px solid #E8EAED; border-radius: 4rpx; margin-bottom: 20rpx; }
.speech-label { font-size: 22rpx; color: #5F6368; font-weight: 700; display: block; margin-bottom: 8rpx; }
.speech-text { font-size: 26rpx; color: #3C4043; line-height: 1.5; font-family: monospace; white-space: pre-wrap; }
.one-click-btn { background: #1A73E8; color: #FFF; font-size: 26rpx; padding: 20rpx; border-radius: 4rpx; border: none; font-weight: 700; cursor: pointer; width: 100%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }

.empty-state { text-align: center; padding: 60rpx 0; }
.empty-icon { font-size: 60rpx; margin-bottom: 16rpx; display: block; filter: grayscale(1); }
.empty-txt { color: #5F6368; font-size: 26rpx; font-weight: 600; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(32,33,36,0.6); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-box { background: #FFF; width: 90%; border-radius: 8rpx; padding: 40rpx; box-shadow: 0 12px 24px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 30rpx; border-bottom: 2px solid #202124; padding-bottom: 10rpx; }
.modal-title { font-size: 32rpx; font-weight: 800; color: #202124; }
.close-btn { font-size: 32rpx; color: #5F6368; font-weight: 800; cursor: pointer; }
.form-item { margin-bottom: 20rpx; }
.form-label { font-size: 24rpx; font-weight: 700; color: #3C4043; display: block; margin-bottom: 8rpx; }
.form-input { width: 100%; padding: 16rpx; border: 1px solid #DADCE0; border-radius: 4rpx; font-size: 28rpx; background: #F8F9FA; box-sizing: border-box; }
.submit-btn { background: #202124; color: #FFF; font-size: 28rpx; padding: 24rpx; border-radius: 4rpx; font-weight: 700; border: none; width: 100%; margin-top: 20rpx; }
</style>
`;
content = content.replace(/<style scoped>[\s\S]*<\/style>/, newStyle.trim());
fs.writeFileSync(file, content);
