<template>
  <div class="stats-container">
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
      <!-- Общее количество -->
      <div class="col">
        <div class="stat-card total">
          <div class="card-body">
            <h5 class="card-title">Всего сотрудников</h5>
            <div class="card-content">
              <span class="stat-value">{{ totalEmployees }}</span>
              <i class="bi bi-people-fill stat-icon"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- На месте -->
      <div class="col">
        <div class="stat-card present">
          <div class="card-body">
            <h5 class="card-title">На месте</h5>
            <div class="card-content">
              <span class="stat-value">{{ presentEmployees }}</span>
              <i class="bi bi-check-circle-fill stat-icon"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- На больничном -->
      <div class="col">
        <div class="stat-card sick">
          <div class="card-body">
            <h5 class="card-title">На больничном</h5>
            <div class="card-content">
              <span class="stat-value">{{ sickEmployees }}</span>
              <i class="bi bi-clipboard-heart-fill stat-icon"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- В отпуске -->
      <div class="col">
        <div class="stat-card vacation">
          <div class="card-body">
            <h5 class="card-title">В отпуске</h5>
            <div class="card-content">
              <span class="stat-value">{{ vacationEmployees }}</span>
              <i class="bi bi-umbrella-fill stat-icon"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const totalEmployees = ref(0)
const presentEmployees = ref(0)
const sickEmployees = ref(0)
const vacationEmployees = ref(0)

async function fetchStats() {
  try {
    // Общее количество
    const { count: total } = await supabase.from('staff').select('*', { count: 'exact' })

    // На месте
    const { count: present } = await supabase
      .from('staff')
      .select('*', { count: 'exact' })
      .eq('status', 'на месте')

    // На больничном
    const { count: sick } = await supabase
      .from('staff')
      .select('*', { count: 'exact' })
      .eq('status', 'на больничном')

    // В отпуске
    const { count: vacation } = await supabase
      .from('staff')
      .select('*', { count: 'exact' })
      .eq('status', 'в отпуске')

    totalEmployees.value = total
    presentEmployees.value = present
    sickEmployees.value = sick
    vacationEmployees.value = vacation
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.stat-card {
  border: none;
  border-radius: 15px;
  padding: 1.5rem;
  color: white;
  transition: transform 0.3s ease;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

/* Цвета карточек */
.total {
  background: linear-gradient(45deg, #4a90e2, #6c5ce7);
}
.present {
  background: linear-gradient(45deg, #00b894, #00cec9);
}
.sick {
  background: linear-gradient(45deg, #ff7675, #e84393);
}
.vacation {
  background: linear-gradient(45deg, #fdcb6e, #e17055);
}

@media (max-width: 768px) {
  .stat-value {
    font-size: 1.8rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .card-title {
    font-size: 1rem;
  }
}
</style>
