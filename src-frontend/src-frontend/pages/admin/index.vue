<template>
  <view class="admin-container">
    <view class="nav-bar">
      <view class="logo-box">⚙️ <text class="logo-text">总部管理后台</text></view>
      <button class="back-btn" @click="goBack">返回门店</button>
    </view>
    
    <view class="tabs">
      <button :class="['tab', currentTab === 'employee' ? 'active' : '']" @click="currentTab = 'employee'">员工</button>
      <button :class="['tab', currentTab === 'category' ? 'active' : '']" @click="currentTab = 'category'">商品类别</button>
      <button :class="['tab', currentTab === 'gift' ? 'active' : '']" @click="currentTab = 'gift'">积分商品</button>
      <button :class="['tab', currentTab === 'knowledge' ? 'active' : '']" @click="currentTab = 'knowledge'">知识库</button>
    </view>

    <view class="content">
      <!-- 员工管理 -->
      <view v-if="currentTab === 'employee'">
        <text class="title">员工列表</text>
        <view class="list">
          <view class="card" v-for="e in employees" :key="e.id">
            <view>
              <text>姓名: {{ e.name }}</text>
              <text> 岗位: {{ e.role }}</text>
              <text> 手机: {{ e.phone }}</text>
            </view>
             <text>可用积分: {{ e.points }}</text>
          </view>
        </view>
      </view>

      <!-- 类别管理 -->
      <view v-if="currentTab === 'category'">
        <text class="title">商品类别管理</text>
        <view class="flex-box">
          <input class="input-line" v-model="newCategory" placeholder="新增类别名" />
          <button class="add-btn" @click="addCategory">添加</button>
        </view>
        <view class="list">
          <view class="card" v-for="c in categories" :key="c.id">
            <text>类别: {{ c.name }}</text>
            <button class="del-btn" @click="delCategory(c.id)">删除</button>
          </view>
        </view>
      </view>

      <!-- 积分商品管理 -->
      <view v-if="currentTab === 'gift'">
        <text class="title">积分兑换商品</text>
        <view class="form-box">
          <input class="input-line" v-model="giftForm.name" placeholder="商品名称" />
          <input class="input-line" v-model="giftForm.pointsRequired" type="number" placeholder="所需积分" />
          <select class="input-line" v-model="giftForm.redeemType">
            <option value="CONSUMER">常规积分</option>
            <option value="RECYCLE">环保积分</option>
          </select>
          <input class="input-line" v-model="giftForm.stock" type="number" placeholder="库存总量" />
          <button class="add-btn" @click="addGift">新增礼品</button>
        </view>
        <view class="list">
          <view class="card flex" v-for="g in gifts" :key="g.id">
            <view>
              <text>{{ g.name }} [{{ g.redeemType === 'RECYCLE' ? '环保券' : '常规抵扣' }}]</text>
              <text class="small">需要: {{ g.pointsRequired }}分 | 库存: {{ g.stock }}</text>
            </view>
            <button class="del-btn" @click="delGift(g.id)">删除</button>
          </view>
        </view>
      </view>

      <!-- 知识库管理 -->
      <view v-if="currentTab === 'knowledge'">
        <text class="title">知识库 (话术/视频/培训)</text>
        <view class="form-box">
          <input class="input-line" v-model="kForm.title" placeholder="标题" />
          <select class="input-line" v-model="kForm.category">
            <option value="PRODUCT">产品知识</option>
            <option value="PARENTING">育儿知识</option>
          </select>
          <input class="input-line" v-model="kForm.videoUrl" placeholder="视频/外部链接" />
          <textarea class="textarea-box" v-model="kForm.content" placeholder="文章内容或核心卖点"></textarea>
          <button class="add-btn" @click="addKnowledge">发 布</button>
        </view>
        <view class="list">
          <view class="card" v-for="k in knowledgeList" :key="k.id">
             <view class="k-title">[{{ k.category }}] {{ k.title }}</view>
             <button class="del-btn" @click="delKnowledge(k.id)">删除</button>
          </view>
        </view>
      </view>

    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const currentTab = ref('employee');

const employees = ref([]);
const categories = ref([]);
const gifts = ref([]);
const knowledgeList = ref([]);

const newCategory = ref('');
const giftForm = ref({ name:'', pointsRequired:'', stock:'', redeemType:'CONSUMER' });
const kForm = ref({ title:'', category:'PRODUCT', videoUrl:'', content:'' });

const goBack = () => { window.uni.navigateBack(); }

const fetchList = async (path, targetRef) => {
  const res = await uni.request({ url: `http://localhost:3000/admin/${path}` });
  if (res.data) targetRef.value = res.data;
}

watch(currentTab, (val) => {
  if (val === 'employee') fetchList('employees', employees);
  if (val === 'category') fetchList('categories', categories);
  if (val === 'gift') fetchList('gifts', gifts);
  if (val === 'knowledge') fetchList('knowledge', knowledgeList);
})

onMounted(() => {
  fetchList('employees', employees);
})

/* category */
const addCategory = async() => {
  if(!newCategory.value) return;
  await uni.request({ method: 'POST', url: 'http://localhost:3000/admin/category', data: { name: newCategory.value }});
  newCategory.value = '';
  fetchList('categories', categories);
}
const delCategory = async(id) => {
  await uni.request({ method: 'DELETE', url: `http://localhost:3000/admin/category/${id}`});
  fetchList('categories', categories);
}

/* gift */
const addGift = async() => {
  await uni.request({ method: 'POST', url: 'http://localhost:3000/admin/gift', data: { 
    name: giftForm.value.name, 
    pointsRequired: Number(giftForm.value.pointsRequired), 
    stock: Number(giftForm.value.stock), 
    redeemType: giftForm.value.redeemType 
  }});
  giftForm.value = { name:'', pointsRequired:'', stock:'', redeemType:'CONSUMER' };
  fetchList('gifts', gifts);
}
const delGift = async(id) => {
  await uni.request({ method: 'DELETE', url: `http://localhost:3000/admin/gift/${id}`});
  fetchList('gifts', gifts);
}

/* knowledge */
const addKnowledge = async() => {
  await uni.request({ method: 'POST', url: 'http://localhost:3000/admin/knowledge', data: kForm.value });
  kForm.value = { title:'', category:'PRODUCT', videoUrl:'', content:'' };
  fetchList('knowledge', knowledgeList);
}
const delKnowledge = async(id) => {
  await uni.request({ method: 'DELETE', url: `http://localhost:3000/admin/knowledge/${id}`});
  fetchList('knowledge', knowledgeList);
}

</script>

<style scoped>
.admin-container { padding: 20px; font-family: sans-serif; background: #fff; min-height: 100vh;}
.nav-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.logo-text { font-size: 20px; font-weight: bold; }
.back-btn { padding: 5px 15px; border-radius: 20px; background: #eee; border: none; cursor: pointer; }
.tabs { display: flex; gap: 10px; margin-bottom: 20px; }
.tab { padding: 8px 16px; border: none; border-radius: 6px; background: #f3f4f6; cursor: pointer; }
.tab.active { background: #3b82f6; color: white; }
.content .title { font-size: 18px; font-weight: bold; margin-bottom: 15px; display: block; padding-top: 10px;}
.form-box { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px; display: flex; flex-direction: column; gap: 10px; }
.list { display: flex; flex-direction: column; gap: 10px; }
.card { background: #f9fafb; border:1px solid #eee; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
.flex-box { display: flex; gap: 10px; margin-bottom: 15px; }
.input-line { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; flex: 1; background: white;}
.textarea-box { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; flex: 1; min-height: 80px; background: white;}
.add-btn { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.del-btn { background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.small { font-size: 12px; color: #666; margin-left: 10px;}
.k-title { font-weight: 500; }
</style>
