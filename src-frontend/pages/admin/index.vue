<template>
  <view class="admin-container">
    <view class="nav-bar">
      <view class="logo-box">⚙️ <text class="logo-text">总部管理后台</text></view>
      <button class="back-btn" @click="goBack">返回门店</button>
    </view>
    
    <view class="tabs">
      <button :class="['tab', currentTab === 'employee' ? 'active' : '']" @click="currentTab = 'employee'">员工</button>
      <button :class="['tab', currentTab === 'product' ? 'active' : '']" @click="currentTab = 'product'">商品</button>
      <button :class="['tab', currentTab === 'gift' ? 'active' : '']" @click="currentTab = 'gift'">积分商品</button>
      <button :class="['tab', currentTab === 'knowledge' ? 'active' : '']" @click="currentTab = 'knowledge'">知识库</button>
    </view>

    <view class="content">
      <!-- 员工管理 -->
      <view v-if="currentTab === 'employee'">
        <text class="title">员工列表</text>
        <view class="list">
          <view class="card" v-for="e in employees" :key="e.id">
            <view v-if="!e.isEditing" style="width:100%; display:flex; justify-content:space-between; align-items:center;">
              <view>
                <text>姓名: {{ e.name }}</text>
                <text> 岗位: {{ e.role }}</text>
                <text> 手机: {{ e.phone }}</text>
              </view>
              <view>
                <text>可用积分: {{ e.points }}</text>
                <button class="add-btn" style="margin-left:10px" @click="editEmployee(e)">编辑</button>
                <button class="del-btn" style="margin-left:10px" @click="delEmployee(e.id)">删除</button>
              </view>
            </view>
            <view v-else style="width:100%; display:flex; flex-direction:column; gap:10px;">
              <input class="input-line" v-model="e.editData.name" placeholder="姓名" />
              <input class="input-line" v-model="e.editData.phone" placeholder="手机" />
              <select class="input-line" v-model="e.editData.role">
                 <option value="CLERK">店员</option>
                 <option value="MANAGER">店长</option>
              </select>
              <view style="display:flex; justify-content:flex-end;">
                 <button class="add-btn" @click="saveEmployee(e)">保存</button>
                 <button class="back-btn" style="margin-left:10px" @click="e.isEditing = false">取消</button>
              </view>
            </view>
          </view>
        </view>
        <view class="form-box" style="margin-top:20px;">
          <text class="title">新增员工</text>
          <view class="flex-box">
            <input class="input-line" v-model="empForm.name" placeholder="员工姓名" />
            <input class="input-line" v-model="empForm.phone" placeholder="手机号" />
            <select class="input-line" v-model="empForm.role">
              <option value="CLERK">店员</option>
              <option value="MANAGER">店长</option>
            </select>
            <button class="add-btn" @click="addEmployee">添加</button>
          </view>
        </view>
      </view>

      <!-- 商品管理 -->
      <view v-if="currentTab === 'product'">
        <text class="title">商品管理</text>
        <view class="flex-box">
          <input class="input-line" v-model="prodForm.name" placeholder="商品名称 (如:超启能恩3段)" />
          <input class="input-line" v-model="prodForm.category" placeholder="分类 (如:奶粉)" />
          <input class="input-line" type="number" v-model="prodForm.price" placeholder="价格" />
          <input class="input-line" type="number" v-model="prodForm.shelfLifeDays" placeholder="保质期(天)" />
          <button class="add-btn" @click="addProduct">录入商品</button>
        </view>
        <view class="list">
          <view class="card" v-for="p in products" :key="p.id">
            <text>名称: {{ p.name }} | 类别: {{ p.category }} | 价格: ¥{{ p.price }} | 保质期: {{ p.shelfLifeDays }}天 | SKU: {{ p.skuCode }}</text>
            <button class="del-btn" @click="delProduct(p.id)">删除</button>
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
            <option value="CONSUMER">常规商品</option>
            <option value="RECYCLE">环保礼品</option>
          </select>
          <input class="input-line" v-model="giftForm.stock" type="number" placeholder="库存总量" />
          <button class="add-btn" @click="addGift">新增礼品</button>
        </view>
        <view class="list">
          <view class="card flex" v-for="g in gifts" :key="g.id">
            <view>
              <text>{{ g.name }} [{{ g.redeemType === 'RECYCLE' ? '环保兑换' : '常规兑换' }}]</text>
              <text class="small">需要: {{ g.pointsRequired }}分 | 库存: {{ g.stock }}</text>
            </view>
            <button class="del-btn" @click="delGift(g.id)">删除</button>
          </view>
        </view>
      </view>

      <!-- 知识库管理 -->
      <view v-if="currentTab === 'knowledge'">
        <text class="title">知识库 (话术/培训资料)</text>
        <view class="form-box">
          <input class="input-line" v-model="kForm.title" placeholder="标题" />
          <select class="input-line" v-model="kForm.category">
            <option value="PRODUCT">产品知识</option>
            <option value="PARENTING">育儿知识</option>
          </select>
          <textarea class="textarea-box" v-model="kForm.content" placeholder="文章内容或核心卖点"></textarea>
          <button class="add-btn" @click="addKnowledge">发布</button>
        </view>
        <view class="list">
          <view class="card" v-for="k in knowledgeList" :key="k.id">
             <!-- Normal Mode -->
             <view v-if="!k.isEditing" style="width:100%;">
               <view class="k-title">[{{ k.category }}] {{ k.title }}</view>
               <view style="margin-top:10px; display:flex; justify-content:flex-end;">
                 <button class="add-btn" @click="editKnowledge(k)">编辑</button>
                 <button class="del-btn" style="margin-left:10px" @click="delKnowledge(k.id)">删除</button>
               </view>
             </view>
             <!-- Edit Mode -->
             <view v-else style="width:100%; display:flex; flex-direction:column; gap:10px;">
                <input class="input-line" v-model="k.editData.title" placeholder="标题" />
                <select class="input-line" v-model="k.editData.category">
                  <option value="PRODUCT">产品知识</option>
                  <option value="PARENTING">育儿知识</option>
                </select>
                <textarea class="textarea-box" v-model="k.editData.content" placeholder="内容"></textarea>
                <view style="display:flex; justify-content:flex-end;">
                   <button class="add-btn" @click="saveKnowledge(k)">保存</button>
                   <button class="back-btn" style="margin-left:10px" @click="k.isEditing = false">取消</button>
                </view>
             </view>
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
const products = ref([]);
const gifts = ref([]);
const knowledgeList = ref([]);

const empForm = ref({ name:'', phone:'', role:'CLERK' });
const prodForm = ref({ name:'', category:'', price:'', shelfLifeDays: '' });
const giftForm = ref({ name:'', pointsRequired:'', stock:'', redeemType:'CONSUMER' });
const kForm = ref({ title:'', category:'PRODUCT', content:'' });

const editEmployee = (e) => {
  e.editData = { ...e };
  e.isEditing = true;
};
const saveEmployee = async (e) => {
  await uni.request({ method: 'PUT', url: `http://localhost:3000/admin/employee/${e.id}`, data: { name: e.editData.name, phone: e.editData.phone, role: e.editData.role } });
  e.isEditing = false;
  fetchList('employees', employees);
};

const editKnowledge = (k) => {
  k.editData = { ...k };
  k.isEditing = true;
};
const saveKnowledge = async (k) => {
  await uni.request({ method: 'PUT', url: `http://localhost:3000/admin/knowledge/${k.id}`, data: { title: k.editData.title, category: k.editData.category, content: k.editData.content } });
  k.isEditing = false;
  fetchList('knowledge', knowledgeList);
};

const goBack = () => { window.uni.navigateBack(); }

const fetchList = async (path, targetRef) => {
  const res = await uni.request({ url: `http://localhost:3000/admin/${path}` });
  if (res.data) targetRef.value = res.data.map(item => ({ ...item, isEditing: false, editData: {} }));
}

watch(currentTab, (val) => {
  if (val === 'employee') fetchList('employees', employees);
  if (val === 'product') fetchList('products', products);
  if (val === 'gift') fetchList('gifts', gifts);
  if (val === 'knowledge') fetchList('knowledge', knowledgeList);
})

onMounted(() => {
  fetchList('employees', employees);
})

/* employee */
const addEmployee = async() => {
  if(!empForm.value.name || !empForm.value.phone) return;
  const res = await uni.request({ method: 'POST', url: 'http://localhost:3000/admin/employee', data: empForm.value });
  if (res.statusCode && res.statusCode >= 400) { alert('添加失败：可能是手机号已存在或其他错误'); }
  else { empForm.value = { name:'', phone:'', role:'CLERK' }; }
  fetchList('employees', employees);
}
const delEmployee = async(id) => {
  await uni.request({ method: 'DELETE', url: `http://localhost:3000/admin/employee/${id}`});
  fetchList('employees', employees);
}

/* product */
const addProduct = async() => {
  if(!prodForm.value.name) return;
  const res = await uni.request({ method: 'POST', url: 'http://localhost:3000/admin/product', data: {
    name: prodForm.value.name,
    category: prodForm.value.category,
    price: Number(prodForm.value.price) || 0,
    shelfLifeDays: Number(prodForm.value.shelfLifeDays) || 365
  }});
  if (res.statusCode && res.statusCode >= 400) { alert('录入失败，请确认所有字段格式'); }
  else { prodForm.value = { name:'', category:'', price:'', shelfLifeDays: '' }; }
  fetchList('products', products);
}
const delProduct = async(id) => {
  await uni.request({ method: 'DELETE', url: `http://localhost:3000/admin/product/${id}`});
  fetchList('products', products);
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
  await uni.request({ method: 'POST', url: 'http://localhost:3000/admin/knowledge', data: { title: kForm.value.title, category: kForm.value.category, content: kForm.value.content } });
  kForm.value = { title:'', category:'PRODUCT', content:'' };
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
.tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.tab { padding: 8px 16px; border: none; border-radius: 6px; background: #f3f4f6; cursor: pointer; }
.tab.active { background: #3b82f6; color: white; }
.content .title { font-size: 18px; font-weight: bold; margin-bottom: 15px; display: block; padding-top: 10px;}
.form-box { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px; display: flex; flex-direction: column; gap: 10px; }
.list { display: flex; flex-direction: column; gap: 10px; }
.card { background: #f9fafb; border:1px solid #eee; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: flex-start; }
.flex-box { display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; }
.input-line { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; flex: 1; min-width: 150px; background: white;}
.textarea-box { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; flex: 1; min-height: 80px; background: white;}
.add-btn { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; }
.del-btn { background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.small { font-size: 12px; color: #666; margin-left: 10px;}
.k-title { font-weight: 500; width: 100%;}
</style>
