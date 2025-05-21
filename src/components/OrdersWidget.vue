<template>
  <div class="orders-widget">
    <h4 class="widget-title">Последние заказы</h4>
    <div class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-id">#{{ order.id }}</span>
          <span class="order-status" :class="statusClass(order.status)">{{ order.status }}</span>
        </div>
        <div class="order-body">
          <h5 class="product-name">{{ order.products?.name }}</h5>
          <p class="order-comment" v-if="order.comment">{{ order.comment }}</p>
          <div class="order-meta">
            <span class="quantity">Количество: {{ order.quantity }}</span>
            <span class="date">{{ formatDate(order.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const orders = ref([])

const loadOrders = async () => {
  try {
    const { data } = await supabase
      .from('orders')
      .select(
        `
        id,
        product_id,
        quantity,
        comment,
        status,
        created_at,
        products (name)
      `,
      )
      .order('created_at', { ascending: false })
      .limit(5)

    orders.value = data
  } catch (error) {
    console.error('Ошибка загрузки заказов:', error)
  }
}

const statusClass = (status) => {
  return {
    'в обработке': 'status-processing',
    выполнен: 'status-completed',
    отменен: 'status-canceled',
  }[status]
}

const formatDate = (dateString) => {
  const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString('ru-RU', options)
}

// Подписка на обновления в реальном времени
const channel = supabase
  .channel('orders-widget')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'orders',
    },
    () => loadOrders(),
  )
  .subscribe()

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-widget {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
}

.widget-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2c3e50;
}

.orders-list {
  display: grid;
  gap: 15px;
}

.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-id {
  font-size: 0.9rem;
  color: #666;
}

.order-status {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 12px;
}

.status-processing {
  background: #fff3cd;
  color: #856404;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-canceled {
  background: #f8d7da;
  color: #721c24;
}

.product-name {
  font-size: 1rem;
  margin-bottom: 8px;
}

.order-comment {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
}

.order-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
}

.date {
  font-style: italic;
}
</style>
