<template>
  <view class="training-container">
    <view class="header">
      <text class="title">🎓 店员培训与考核</text>
      <button class="back-btn" @click="goBack">返回</button>
    </view>

    <view class="tabs">
      <text class="tab-item" :class="{ active: currentTab === 'courses' }" @click="currentTab = 'courses'">📚 知识体系与课程</text>
      <text class="tab-item" :class="{ active: currentTab === 'assessment' }" @click="currentTab = 'assessment'">🏆 定期测评考核</text>
    </view>

    <!-- 知识体系与课程页 -->
    <scroll-view scroll-y class="tab-content" v-if="currentTab === 'courses'">
      <view class="sub-tabs">
        <text class="sub-tab" :class="{ active: category === 'PRODUCT' }" @click="category = 'PRODUCT'">产品知识库</text>
        <text class="sub-tab" :class="{ active: category === 'PARENTING' }" @click="category = 'PARENTING'">育儿知识库</text>
      </view>

      <view class="article-list">
        <view class="article-card" v-for="item in filteredArticles" :key="item.id">
          <text class="art-title">{{ item.title }}</text>
          <text class="art-label">{{ item.category === 'PRODUCT' ? '卖点解析 & 答疑' : '实用育儿指南' }}</text>
          
          <text class="art-content">{{ item.content }}</text>
        </view>
        <view class="empty-state" v-if="filteredArticles.length === 0">
          暂无相关知识内容
        </view>
      </view>
    </scroll-view>

    <!-- 定期测评考核页 -->
    <scroll-view scroll-y class="tab-content" v-if="currentTab === 'assessment'">
      <view class="action-bar">
        <button class="new-assess-btn" @click="showModal = true">📝 发起半年考核测定</button>
      </view>

      <view class="assess-list">
        <view class="assess-card" v-for="item in assessments" :key="item.id">
          <view class="a-header">
            <text class="a-emp">👤 {{ item.employee?.name || '店员' }}</text>
            <text class="a-period">{{ item.period }}</text>
          </view>
          <view class="score-grid">
            <view class="score-box">
              <text class="s-val">{{ item.knowledgeScore }}</text>
              <text class="s-tit">知识考核(40%)</text>
            </view>
            <view class="score-box">
              <text class="s-val">{{ item.ownerReviewScore }}</text>
              <text class="s-tit">店主评价(30%)</text>
            </view>
            <view class="score-box">
              <text class="s-val">{{ item.customerReviewScore }}</text>
              <text class="s-tit">客情评价(30%)</text>
            </view>
          </view>
          <view class="final-result" :class="getResultClass(item.finalScore)">
             <text class="result-title">综合总评：{{ item.finalScore }} 分</text>
             <text class="result-desc">结论与奖惩：{{ item.result }}</text>
          </view>
        </view>

        <view class="empty-state" v-if="assessments.length === 0">
          暂未发起过考核
        </view>
      </view>
    </scroll-view>

    <!-- 发起考核弹窗 -->
    <view class="modal-overlay" v-if="showModal">
      <view class="modal-box slide-up">
        <view class="modal-header">
          <text class="m-title">综合考量评定</text>
          <text class="m-close" @click="showModal = false">✕</text>
        </view>
        <view class="form-body">
          <view class="f-row">
            <text class="f-label">参评店员</text>
            <select class="f-input" v-model="form.employeeId">
               <option disabled value="">请选择人员</option>
               <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </view>
          <view class="f-row">
            <text class="f-label">考核周期</text>
            <input class="f-input" v-model="form.period" placeholder="如: 2026年上半年" />
          </view>
          <view class="f-row">
            <text class="f-label">产品/知识机考得分</text>
            <input class="f-input" type="number" v-model="form.knowledgeScore" placeholder="0-100" />
          </view>
          <view class="f-row">
            <text class="f-label">店长主管评分</text>
            <input class="f-input" type="number" v-model="form.ownerReviewScore" placeholder="0-100" />
          </view>
          <view class="f-row">
            <text class="f-label">客户反馈/客情分</text>
            <input class="f-input" type="number" v-model="form.customerReviewScore" placeholder="0-100" />
          </view>
          
          <button class="submit-btn" @click="submitAssessment">🚀 生成考核结论与排名</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const currentTab = ref('courses');
const category = ref('PRODUCT');
const articles = ref([]);
const assessments = ref([]);
const employees = ref([]);

const showModal = ref(false);
const form = ref({
  employeeId: '',
  period: '2026年上半年',
  knowledgeScore: '',
  ownerReviewScore: '',
  customerReviewScore: ''
});

onMounted(() => {
  fetchArticles();
  fetchAssessments();
  fetchEmployees();
});

const fetchArticles = async () => {
  try {
    const res = await uni.request({ url: 'http://localhost:3000/training/articles' });
    if (res.data?.data) articles.value = res.data.data;
  } catch(e) {}
};

const fetchAssessments = async () => {
  try {
    const res = await uni.request({ url: 'http://localhost:3000/training/assessments' });
    if (res.data?.data) assessments.value = res.data.data;
  } catch(e) {}
};

const fetchEmployees = async () => {
  try {
    const res = await uni.request({ url: 'http://localhost:3000/training/employees' });
    if (res.data?.data) employees.value = res.data.data;
  } catch(e) {}
};

const filteredArticles = computed(() => {
  return articles.value.filter(a => a.category === category.value);
});

const submitAssessment = async () => {
  if (!form.value.employeeId) return alert('请选择店员');
  if (!form.value.knowledgeScore) return alert('请填入知识考核分数');

  try {
    await uni.request({
      url: 'http://localhost:3000/training/assess',
      method: 'POST',
      data: {
        employeeId: form.value.employeeId,
        period: form.value.period,
        knowledgeScore: Number(form.value.knowledgeScore),
        ownerReviewScore: Number(form.value.ownerReviewScore || 0),
        customerReviewScore: Number(form.value.customerReviewScore || 0)
      }
    });
    uni.showToast({ title: '评定完成', icon: 'success' });
    showModal.value = false;
    currentTab.value = 'assessment';
    form.value = { employeeId: '', period: '2026年下半年', knowledgeScore: '', ownerReviewScore: '', customerReviewScore: '' };
    fetchAssessments();
  } catch (e) {
    alert('提交失败');
  }
};

const getResultClass = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'pass';
  return 'fail';
};

const goBack = () => uni.navigateBack();
</script>

<style scoped>
.training-container { background: #f0f2f5; min-height: 100vh; display: flex; flex-direction: column; font-family: -apple-system, sans-serif; color: #333; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 40rpx 30rpx 20rpx; background: #fff; }
.title { font-size: 36rpx; font-weight: 800; color: #1a1a1a; }
.back-btn { font-size: 24rpx; color: #1A73E8; background: transparent; border: 1px solid #1A73E8; padding: 10rpx 24rpx; border-radius: 4rpx; }

.tabs { display: flex; background: #fff; padding: 0 30rpx; box-shadow: 0 2px 8px rgba(0,0,0,0.05); z-index: 10; margin-bottom: 2rpx;}
.tab-item { flex: 1; text-align: center; padding: 24rpx 0; font-size: 28rpx; font-weight: bold; color: #666; position: relative; transition: color 0.3s; }
.tab-item.active { color: #1A73E8; }
.tab-item.active::after { content: ''; position: absolute; bottom: 0; left: 30%; width: 40%; height: 6rpx; background: #1A73E8; border-radius: 3rpx; }

.tab-content { flex: 1; padding: 30rpx; background: #f0f2f5; height: 0; /* Let flex control height for scroll */ }

/* 知识库 */
.sub-tabs { display: flex; gap: 20rpx; margin-bottom: 30rpx; }
.sub-tab { padding: 12rpx 30rpx; background: #fff; border-radius: 40rpx; font-size: 24rpx; font-weight: 600; color: #666; cursor: pointer; border: 1px solid #e1e4e8; }
.sub-tab.active { background: #e6f0fd; color: #1a73e8; border-color: #c0d8fa; }

.article-list { display: flex; flex-direction: column; gap: 30rpx; padding-bottom: 60rpx; }
.article-card { background: #fff; padding: 30rpx; border-radius: 12rpx; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
.art-title { font-size: 32rpx; font-weight: 700; color: #222; display: block; margin-bottom: 12rpx; }
.art-label { display: inline-block; font-size: 20rpx; background: #ffefed; color: #d93d3d; padding: 4rpx 12rpx; border-radius: 4rpx; font-weight: 800; margin-bottom: 24rpx; }
.art-content { font-size: 26rpx; color: #555; line-height: 1.6; }

.video-box { margin-bottom: 20rpx; background: #000; border-radius: 8rpx; overflow: hidden; height: 320rpx; display: flex; align-items: center; justify-content: center; }
.poster { text-align: center; color: #fff; opacity: 0.8; }
.play-icon { font-size: 64rpx; display: block; margin-bottom: 10rpx; }
.play-text { font-size: 24rpx; font-weight: 500; }

/* 考核评定 */
.action-bar { display: flex; justify-content: flex-end; margin-bottom: 30rpx; }
.new-assess-btn { background: #202124; color: #fff; font-size: 26rpx; padding: 16rpx 40rpx; font-weight: 700; border-radius: 8rpx; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: none; cursor: pointer; }

.assess-list { display: flex; flex-direction: column; gap: 30rpx; padding-bottom: 60rpx;}
.assess-card { background: #fff; padding: 30rpx; border-radius: 12rpx; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
.a-header { display: flex; justify-content: space-between; border-bottom: 1px dashed #eee; padding-bottom: 20rpx; margin-bottom: 20rpx; }
.a-emp { font-size: 30rpx; font-weight: 800; color: #222; }
.a-period { font-size: 24rpx; color: #888; background: #f4f5f7; padding: 4rpx 16rpx; border-radius: 20rpx; }

.score-grid { display: flex; gap: 16rpx; margin-bottom: 24rpx; }
.score-box { flex: 1; background: #fafafa; border-radius: 8rpx; padding: 16rpx; text-align: center; border: 1px solid #f0f0f0; }
.s-val { display: block; font-size: 32rpx; font-weight: 900; color: #1a73e8; margin-bottom: 8rpx; }
.s-tit { font-size: 20rpx; color: #666; }

.final-result { padding: 24rpx; border-radius: 8rpx; border-left: 8rpx solid #ddd; }
.final-result.excellent { background: #f0faf3; border-left-color: #34A853; }
.final-result.good { background: #f4f8fe; border-left-color: #1A73E8; }
.final-result.pass { background: #fff8eb; border-left-color: #FBBC05; }
.final-result.fail { background: #fef2f2; border-left-color: #EA4335; }

.result-title { display: block; font-size: 28rpx; font-weight: 800; color: #333; margin-bottom: 8rpx; }
.result-desc { font-size: 24rpx; color: #555; line-height: 1.4; font-weight: 600;}

.empty-state { text-align: center; padding: 80rpx 0; color: #999; font-size: 28rpx; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-box { background: #fff; width: 640rpx; max-width: 90vw; border-radius: 16rpx; padding: 40rpx; box-sizing: border-box; }
.slide-up { animation: slideUp 0.3s ease forwards; }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40rpx; }
.m-title { font-size: 34rpx; font-weight: 800; color: #222; }
.m-close { font-size: 32rpx; color: #888; cursor: pointer; }

.f-row { margin-bottom: 24rpx; }
.f-label { display: block; font-size: 24rpx; font-weight: 700; color: #444; margin-bottom: 12rpx; }
.f-input { width: 100%; box-sizing: border-box; border: 1px solid #ddd; background: #fdfdfd; padding: 20rpx; border-radius: 8rpx; font-size: 26rpx; }
.f-input:focus { border-color: #1a73e8; outline: none; background: #fff; }

.submit-btn { width: 100%; border: none; background: linear-gradient(135deg, #1A73E8, #2e86f8); color: #fff; border-radius: 8rpx; padding: 24rpx; font-size: 28rpx; font-weight: 800; cursor: pointer; margin-top: 20rpx; }
</style>
