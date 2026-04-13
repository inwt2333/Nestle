<template>
  <view class="customers-container">
    <view class="header">
      <text class="title">客户管理 ({{ customers.length }}人)</text>
      <button class="back-btn" @click="goBack">返回</button>
    </view>

    <view class="customer-list">
      <view
        class="customer-card"
        v-for="(customer, index) in customers"
        :key="customer.id"
      >
        <!-- 卡片头部 (总览) -->
        <view class="card-header" @click="toggleExpand(customer.id)">
          <view class="avatar-wrap">
            <text class="avatar">{{
              customer.nickname ? customer.nickname.charAt(0) : "客"
            }}</text>
          </view>
          <view class="head-info">
            <text class="c-name"
              >{{ customer.nickname || "未命名顾客" }} 的宝宝:
              {{ getBabyProfile(customer).name || "未命名" }}</text
            >
            <text class="c-sub"
              >出生日期:
              {{ formatDate(getBabyProfile(customer).birthDate) }}</text
            >
          </view>
          <view class="expand-icon">{{
            expanded[customer.id] ? "▲" : "▼"
          }}</view>
        </view>

        <!-- 卡片详细内容 (折叠/展开区域) -->
        <view class="card-content" v-if="expanded[customer.id]">
          <view class="divider"></view>

          <view class="info-row">
            <text class="label">顾客称呼:</text>
            <input
              class="value input"
              :value="customer.nickname || ''"
              @input="(e) => (customer.nickname = e.target.value)"
              placeholder="例如: 赵女士"
            />
          </view>
          <view class="info-row">
            <text class="label">手机号码:</text>
            <input
              class="value input"
              :value="customer.phone || ''"
              @input="(e) => (customer.phone = e.target.value)"
              placeholder="需输入实名手机"
            />
          </view>

          <view class="info-row">
            <text class="label">宝宝昵称:</text>
            <input
              class="value input"
              :value="getBabyProfile(customer).name || ''"
              @input="
                (e) => updateBabyProfile(customer, 'name', e.target.value)
              "
              placeholder="如: 小汤圆"
            />
          </view>

          <view class="info-row">
            <text class="label">出生日期:</text>
            <input
              class="value input"
              type="date"
              :value="
                formatDate(getBabyProfile(customer).birthDate, 'YYYY-MM-DD')
              "
              @input="
                (e) => updateBabyProfile(customer, 'birthDate', e.target.value)
              "
            />
          </view>

          <view class="info-row">
            <text class="label">过敏史:</text>
            <input
              class="value input"
              :value="getBabyProfile(customer).allergyInfo || ''"
              @input="
                (e) =>
                  updateBabyProfile(customer, 'allergyInfo', e.target.value)
              "
              placeholder="无 / 牛奶过敏等"
            />
          </view>

          <view class="ai-status">
            <text class="icon">🤖</text>
            <text class="status-text">{{ getLastTaskStatus(customer) }}</text>
          </view>

          <view class="actions">
            <button class="btn del-btn" @click="removeCustomer(customer.id)">
              删除
            </button>
            <button class="btn save-btn" @click="saveCustomer(customer)">
              保存修改
            </button>
          </view>
        </view>
      </view>

      <view v-if="customers.length === 0" class="empty">
        <text>暂无顾客，快去首页录入吧</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";

const customers = ref([]);
const expanded = ref({});

const fetchCustomers = async () => {
  try {
    const res = await uni.request({
      url: "http://localhost:3000/business/customers",
      method: "GET",
    });
    if (res.data && Array.isArray(res.data)) {
      customers.value = res.data.map((c) => {
        if (!c.babyProfiles || c.babyProfiles.length === 0)
          c.babyProfiles = [{}];
        return c;
      });
    }
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  fetchCustomers();
});

const toggleExpand = (id) => {
  expanded.value[id] = !expanded.value[id];
};

const getBabyProfile = (customer) => {
  return customer.babyProfiles && customer.babyProfiles.length > 0
    ? customer.babyProfiles[0]
    : {};
};

const updateBabyProfile = (customer, key, value) => {
  if (!customer.babyProfiles || customer.babyProfiles.length === 0)
    customer.babyProfiles = [{}];
  customer.babyProfiles[0][key] = value;
};

// 格式化日期显示
const formatDate = (dateStr, format = "zh") => {
  if (!dateStr) return "未设置";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  if (format === "YYYY-MM-DD") return `${y}-${m}-${day}`;
  return `${y}年${m}月${day}日`;
};

// 计算上一次发送任务状态
const getLastTaskStatus = (customer) => {
  if (!customer.employeeTasks || customer.employeeTasks.length === 0) {
    return "从未发送过 AI 关怀提醒";
  }
  const lastTask = customer.employeeTasks[0];
  const days = Math.floor(
    (Date.now() - new Date(lastTask.createdAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (days === 0) return "今天刚发送过 AI 关怀提醒";
  return `上次发送关怀是 ${days} 天前：${lastTask.title}`;
};

const saveCustomer = async (customer) => {
  try {
    const baby = customer.babyProfiles[0] || {};
    // 将普通日期字符串转回标准 ISO 格式存入 DB
    let bd = new Date().toISOString();
    if (baby.birthDate) {
      if (baby.birthDate.includes("T")) bd = baby.birthDate;
      else bd = new Date(baby.birthDate).toISOString();
    }

    await uni.request({
      url: `http://localhost:3000/business/customer/${customer.id}`,
      method: "PUT",
      data: {
        nickname: customer.nickname,
        phone: customer.phone,
        babyName: baby.name || "未命名宝宝",
        birthDate: bd,
        allergyInfo: baby.allergyInfo || "无",
      },
    });
    uni.showToast({ title: "保存成功", icon: "none" });
  } catch (e) {
    alert("保存失败: " + String(e));
  }
};

const removeCustomer = async (id) => {
  if (!window.confirm("确认彻底删除该顾客档案及其产生的所有订单记录吗？"))
    return;
  try {
    await uni.request({
      url: `http://localhost:3000/business/customer/${id}`,
      method: "DELETE",
    });
    uni.showToast({ title: "已删除", icon: "none" });
    fetchCustomers();
  } catch (e) {
    alert("删除失败");
  }
};

const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.customers-container {
  padding: 30rpx;
  background: #f4f6f9;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 900;
  color: #222;
}

.back-btn {
  font-size: 26rpx;
  color: #333;
  background: #fff;
  border: none;
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.customer-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.customer-card {
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  cursor: pointer;
}

.avatar-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #0056d2, #0076ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 86, 210, 0.2);
}

.avatar {
  font-size: 32rpx;
  font-weight: bold;
}

.head-info {
  flex: 1;
}
.c-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 6rpx;
}
.c-sub {
  font-size: 26rpx;
  color: #888;
  display: block;
}
.expand-icon {
  font-size: 24rpx;
  color: #c0c0c0;
}

.card-content {
  padding: 0 30rpx 30rpx;
  background: #fafbfc;
}

.divider {
  height: 1rpx;
  background: #eee;
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}
.label {
  width: 140rpx;
  font-size: 28rpx;
  color: #555;
  font-weight: bold;
}
.input {
  flex: 1;
  border: 1px solid #e4e7ed;
  padding: 16rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  background: #fff;
  transition: border 0.2s;
}
.input:focus {
  outline: none;
  border-color: #0056d2;
}

.ai-status {
  display: flex;
  align-items: center;
  background: #ebf3ff;
  padding: 20rpx;
  border-radius: 12rpx;
  margin: 30rpx 0 20rpx;
}
.ai-status .icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}
.status-text {
  font-size: 26rpx;
  color: #0056d2;
  font-weight: 600;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: 10rpx;
}
.btn {
  font-size: 26rpx;
  padding: 18rpx 40rpx;
  border-radius: 40rpx;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s;
}
.btn:active {
  transform: scale(0.96);
}
.save-btn {
  background: #0056d2;
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 86, 210, 0.3);
}
.del-btn {
  background: transparent;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
}
.empty {
  text-align: center;
  color: #999;
  padding: 100rpx 0;
  font-size: 28rpx;
}
</style>
