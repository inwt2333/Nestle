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
              <view style="display:flex; flex-direction:column; gap:6px;">
                <text>姓名: {{ e.name }}</text>
                <text>岗位: {{ e.role }}</text>
                <text>手机: {{ e.phone }}</text>
              </view>
              <view>
                <button class="add-btn" style="margin-left:10px" @click="editEmployee(e)">编辑</button>
                <button class="del-btn" style="margin-left:10px" @click="delEmployee(e.id)">删除</button>
              </view>
            </view>
            <view v-else style="width:100%; display:flex; flex-direction:column; gap: 24px;">
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
          <view class="file-box" style="width: 100%; border: 1px dashed #cbd5e1; padding: 12px; border-radius: 8px; display: flex; align-items: center; background: #fff;">
            <text style="margin-right:12px;color:#64748b;">选择本地商品图片：</text>
            <input type="file" accept="image/*" @change="onImageSelected" />
            <img v-if="prodForm.imageUrl" :src="prodForm.imageUrl" style="width: 40px; height: 40px; margin-left: 10px; border-radius: 4px; object-fit: cover; vertical-align: middle;" />
          </view>
          <button class="add-btn" @click="addProduct">录入商品</button>
        </view>
        <view class="list">
          <view class="card" v-for="p in products" :key="p.id">
            <img v-if="p.imageUrl" :src="p.imageUrl" style="width: 50px; height: 50px; border-radius: 4px; margin-right: 12px; object-fit: cover;" />
            <text style="flex:1;">名称: {{ p.name }} | 类别: {{ p.category }} | 价格: ¥{{ p.price }} | 保质期: {{ p.shelfLifeDays }}天 | SKU: {{ p.skuCode }}</text>
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
             <view v-else style="width:100%; display:flex; flex-direction:column; gap: 24px;">
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
const prodForm = ref({ name:'', category:'', price:'', shelfLifeDays: '', imageUrl: '' });
const giftForm = ref({ name:'', pointsRequired:'', stock:'', redeemType:'CONSUMER' });
const kForm = ref({ title:'', category:'PRODUCT', content:'' });

const onImageSelected = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    prodForm.value.imageUrl = ev.target.result;
  };
  reader.readAsDataURL(file);
};

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
    shelfLifeDays: Number(prodForm.value.shelfLifeDays) || 365,
    imageUrl: prodForm.value.imageUrl
  }});
  if (res.statusCode && res.statusCode >= 400) { alert('录入失败，请确认所有字段格式'); }
  else { prodForm.value = { name:'', category:'', price:'', shelfLifeDays: '', imageUrl: '' }; }
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
.admin-container {
  padding: 30px 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f4f7fe;
  min-height: 100vh;
  box-sizing: border-box;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: #ffffff;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.logo-box {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-text {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
}

.back-btn {
  padding: 8px 20px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #e2e8f0;
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.tab {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: #ffffff;
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.tab.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.content {
  background: transparent;
}

.content .title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
  display: block;
}

.form-box {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0,0,0,0.02);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
}

.card.flex {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.flex-box {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.input-line {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  flex: 1;
  min-width: 180px;
  background: #f8fafc;
  font-size: 14px;
  color: #334155;
  transition: border-color 0.2s, background 0.2s;
}

.input-line:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.textarea-box {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  flex: 1;
  min-height: 100px;
  background: #f8fafc;
  font-family: inherit;
  font-size: 14px;
  color: #334155;
  resize: vertical;
  transition: border-color 0.2s, background 0.2s;
}

.textarea-box:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.add-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  transition: all 0.2s;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.add-btn:active {
  transform: scale(0.96);
}

.del-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  transition: all 0.2s;
}

.del-btn:active {
  transform: scale(0.96);
}

.small {
  font-size: 13px;
  color: #64748b;
  margin-top: 5px;
  display: block;
}

.k-title {
  font-weight: 700;
  font-size: 16px;
  color: #1e293b;
  width: 100%;
}
</style>
