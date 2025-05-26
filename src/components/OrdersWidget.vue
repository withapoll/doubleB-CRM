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
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  padding: 28px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.06),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  margin-top: 30px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.orders-widget:hover {
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.widget-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #1a1a1a;
  position: relative;
  display: inline-block;
  background: #333;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.orders-list {
  display: grid;
  gap: 20px;
}

.order-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.order-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.order-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s;
}

.order-card:hover::before {
  left: 150%;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.order-id {
  font-size: 0.95rem;
  font-weight: 500;
  color: #4b5563;
  letter-spacing: -0.02em;
}

.order-status {
  font-size: 0.85rem;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.status-processing {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.status-completed {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-canceled {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
  color: #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-name::before {
  content: '🍔';
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}

.order-comment {
  font-size: 0.95rem;
  color: #4b5563;
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(249, 250, 251, 0.6);
  border-radius: 8px;
  border-left: 3px solid rgba(79, 70, 229, 0.4);
}

.order-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #6b7280;
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-style: italic;
}

.date::before {
  content: '⏳';
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
}

@keyframes shine {
  0% {
    transform: translateX(-100%) skew(-15deg);
  }
  100% {
    transform: translateX(200%) skew(-15deg);
  }
}

@media (max-width: 768px) {
  .orders-widget {
    padding: 20px;
    border-radius: 20px;
  }

  .widget-title {
    font-size: 1.2rem;
  }

  .product-name {
    font-size: 1rem;
  }
}
</style>
