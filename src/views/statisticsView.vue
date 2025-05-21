<template>
  <div class="container">
    <h1 class="mb-4">Общая статистика по бизнесу</h1>

    <!-- Компонент с карточками статистики -->
    <StatsCards />
    <AnalyticsChart class="mt-4" />
    <EmployeesPreview />
    <OrdersWidget />
  </div>
</template>

<script>
import { ref } from 'vue'
import StatsCards from '@/components/StatsCards.vue'
import EmployeesPreview from '@/components/EmployeesPreview.vue'
import OrdersWidget from '@/components/OrdersWidget.vue'
import AnalyticsChart from '@/components/AnalyticsChart.vue'

export default {
  name: 'StatisticsView',
  components: {
    StatsCards,
    EmployeesPreview,
    OrdersWidget,
    AnalyticsChart,
  },
  setup() {
    const dateRange = ref(null)

    return {
      dateRange,
    }
  },
}
</script>

<style scoped>
.container {
  padding: 20px;
}

h1 {
  font-weight: 600;
  color: #2c3e50;
  margin-top: 30px;
}

@media (min-width: 768px) {
  .container {
    padding: 40px;
  }

  h1 {
    font-size: 2.5rem;
    margin-top: 50px;
  }
}
</style>
