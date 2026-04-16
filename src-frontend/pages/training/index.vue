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
.training-container {
  background: #f4f7fe;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1e293b;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 27px 20px;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  z-index: 20;
}

.title { font-size: 24px; font-weight: 800; color: #0f172a; }

.back-btn {
  font-size: 18px; color: #475569; background: #f1f5f9; border: none;
  padding: 8px 19px; border-radius: 8px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.back-btn:hover { background: #e2e8f0; }

.tabs {
  display: flex; background: #ffffff; padding: 0 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02); z-index: 10; margin-bottom: 2px;
}

.tab-item {
  flex: 1; text-align: center; padding: 16px 0; font-size: 19px;
  font-weight: 700; color: #64748b; position: relative; transition: color 0.3s;
  cursor: pointer;
}
.tab-item.active { color: #2563eb; }
.tab-item.active::after {
  content: ''; position: absolute; bottom: 0; left: 30%; width: 40%;
  height: 4px; background: #2563eb; border-radius: 4px 4px 0 0;
}

.tab-content { flex: 1; padding: 27px; background: transparent; height: 0; }

.sub-tabs { display: flex; gap: 27px; margin-bottom: 27px; }
.sub-tab {
  padding: 10px 22px; background: #ffffff; border-radius: 27px;
  font-size: 18px; font-weight: 700; color: #64748b; cursor: pointer;
  border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  transition: all 0.2s ease;
}
.sub-tab.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff; border-color: transparent; box-shadow: 0 4px 12px rgba(37,99,235,0.25);
}

.article-list { display: flex; flex-direction: column; gap: 27px; padding-bottom: 40px; }
.article-card {
  background: #ffffff; padding: 27px; border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02);
  transition: transform 0.2s;
}
.article-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06); }

.art-title { font-size: 22px; font-weight: 800; color: #0f172a; display: block; margin-bottom: 8px; }
.art-label {
  display: inline-block; font-size: 15px; background: #eff6ff; color: #2563eb;
  padding: 4px 11px; border-radius: 6px; font-weight: 700; margin-bottom: 27px;
}
.art-content { font-size: 19px; color: #475569; line-height: 1.6; white-space: pre-wrap; }

.action-bar { display: flex; justify-content: flex-end; margin-bottom: 27px; }
.new-assess-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff;
  font-size: 19px; padding: 12px 27px; font-weight: 800; border-radius: 10px;
  box-shadow: 0 4px 15px rgba(16,185,129,0.25); border: none; cursor: pointer; transition: transform 0.2s;
}
.new-assess-btn:active { transform: scale(0.96); }

.assess-list { display: flex; flex-direction: column; gap: 27px; padding-bottom: 40px; }
.assess-card {
  background: #ffffff; padding: 27px; border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02);
}
.a-header {
  display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 14px; margin-bottom: 27px;
}
.a-emp { font-size: 22px; font-weight: 800; color: #0f172a; }
.a-period { font-size: 16px; color: #64748b; background: #f1f5f9; padding: 4px 14px; border-radius: 14px; font-weight: 600; }

.score-grid { display: flex; gap: 27px; margin-bottom: 27px; }
.score-box {
  flex: 1; background: #f8fafc; border-radius: 10px; padding: 27px;
  text-align: center; border: 1px solid rgba(0,0,0,0.02);
}
.s-val { display: block; font-size: 24px; font-weight: 900; color: #3b82f6; margin-bottom: 6px; }
.s-tit { font-size: 15px; color: #64748b; font-weight: 600; }

.final-result { padding: 27px; border-radius: 10px; border-left: 6px solid #cbd5e1; }
.final-result.excellent { background: #dcfce7; border-left-color: #10b981; }
.final-result.good { background: #e0f2fe; border-left-color: #3b82f6; }
.final-result.pass { background: #fef3c7; border-left-color: #f59e0b; }
.final-result.fail { background: #fee2e2; border-left-color: #ef4444; }

.result-title { display: block; font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 7px; }
.result-desc { font-size: 18px; color: #334155; line-height: 1.5; font-weight: 600; }

.empty-state { text-align: center; padding: 54px 0; color: #94a3b8; font-size: 20px; font-weight: 600; }

.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; z-index: 999;
}
.modal-box { background: #ffffff; width: 90%; max-width: 400px; border-radius: 16px; padding: 27px; box-sizing: border-box; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
.slide-up { animation: slideUp 0.3s ease forwards; }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 27px; }
.m-title { font-size: 23px; font-weight: 800; color: #0f172a; }
.m-close { font-size: 24px; color: #94a3b8; cursor: pointer; font-weight: 800; }

.f-row { margin-bottom: 27px; }
.f-label { display: block; font-size: 18px; font-weight: 700; color: #475569; margin-bottom: 8px; }
.f-input {
  width: 100%; box-sizing: border-box; border: 1px solid #e2e8f0;
  background: #f8fafc; padding: 27px; border-radius: 10px; font-size: 19px; outline: none; transition: all 0.2s;
}
.f-input:focus { border-color: #3b82f6; background: #ffffff; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.submit-btn {
  width: 100%; border: none; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff; border-radius: 10px; padding: 27px; font-size: 20px;
  font-weight: 800; cursor: pointer; margin-top: 20px; box-shadow: 0 4px 15px rgba(37,99,235,0.25); transition: transform 0.2s;
}
.submit-btn:active { transform: scale(0.96); }
</style>
