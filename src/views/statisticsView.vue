<template>
  <div class="container">
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
  padding: 50px;
  margin: 0 auto;
}
</style>
