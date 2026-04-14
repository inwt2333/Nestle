const fs = require('fs');

const file = '/Users/inwt233/Nestle/src-frontend/pages/inventory/index.vue';
let content = fs.readFileSync(file, 'utf8');

const replacement = `const activeTab = ref('list');
const inventories = ref([]);
const products = ref([]);

const groupedInventories = computed(() => {
  const map = {};
  
  // 先把所有后台商品放入 map
  products.value.forEach(p => {
    map[p.id] = {
      productId: p.id,
      productName: p.name,
      shelfLifeDays: p.shelfLifeDays || 365,
      totalStock: 0,
      expanded: false,
      batches: []
    };
  });

  // 再遍历库存批次累计
  inventories.value.forEach(item => {
    const pid = item.productId || 'unknown';
    if (!map[pid]) {
      map[pid] = {
        productId: pid,
        productName: item.product ? item.product.name : '未知产品',
        shelfLifeDays: item.product ? item.product.shelfLifeDays : 365,
        totalStock: 0,
        expanded: false,
        batches: []
      };
    }
    map[pid].totalStock += item.stock;
    map[pid].batches.push(item);
  });
  
  // 有库存批次的则默认展开
  Object.values(map).forEach(group => {
    group.expanded = group.batches.length > 0;
  });

  return Object.values(map);
});
const loadingAi = ref(false);
const aiAdvice = ref('');

const inboundData = ref({
  skuCode: '',
  batchCode: '',
  productionDate: new Date().toISOString().split('T')[0],
  stock: 12
});

const showStocktakeModal = ref(false);
const curTakeItem = ref(null);
const newStockVal = ref('');

onMounted(() => {
  fetchInventory();
  fetchProducts();
});

const fetchProducts = async () => {
  try {
    const res = await uni.request({ url: 'http://localhost:3000/admin/products', method: 'GET' });
    if (res.data) products.value = res.data;
  } catch(e) { console.error(e); }
};

const fetchInventory = async () => {
  try {
    const res = await uni.request({ url: 'http://localhost:3000/inventory', method: 'GET' });
    if (res.data) inventories.value = res.data;
  } catch(e) { console.error(e); }
};`;

content = content.replace(
  /const activeTab = ref\('list'\);[\s\S]*?const fetchInventory = async \(\) => {[\s\S]*?if \(res\.data\) inventories\.value = res\.data;\s*\} catch\(e\) \{ console\.error\(e\); \}\s*\};/,
  replacement
);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched');
