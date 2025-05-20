<template>
  <div class="container">
    <h1 class="mb-4">Общая статистика по бизнесу</h1>

    <!-- Компонент с карточками статистики -->
    <StatsCards />

    <!-- Дополнительные элементы статистики можно добавить здесь -->
  </div>
</template>

<script>
import StatsCards from '@/components/StatsCards.vue'

export default {
  name: 'StatisticsView',
  components: {
    StatsCards,
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
