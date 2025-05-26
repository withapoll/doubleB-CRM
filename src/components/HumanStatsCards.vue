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
.stats-container {
  margin: 2rem 0;
  padding: 0 1rem;
}

.stat-card {
  border: none;
  border-radius: 20px;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%);
  transform: rotate(45deg);
  pointer-events: none;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.03em;
}

.stat-icon {
  font-size: 2.8rem;
  opacity: 0.15;
  color: #1e293b;
}

/* Цветовые акценты */
.total {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
}
.total .stat-icon {
  color: #6366f1;
}

.present {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
}
.present .stat-icon {
  color: #22c55e;
}

.sick {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.2);
}
.sick .stat-icon {
  color: #eab308;
}

.vacation {
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(14, 165, 233, 0.2);
}
.vacation .stat-icon {
  color: #0ea5e9;
}

@media (max-width: 768px) {
  .stat-card {
    min-height: 140px;
    padding: 1.25rem;
  }

  .stat-value {
    font-size: 2rem;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .card-title {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .stats-container {
    margin: 1rem 0;
  }

  .stat-card {
    min-height: 120px;
  }

  .stat-value {
    font-size: 1.8rem;
  }
}
</style>
