<!-- components/EmployeesPreview.vue -->
<template>
  <div class="employees-preview">
    <div class="header">
      <h4>Последние сотрудники</h4>
      <router-link to="/staff" class="view-all">Все сотрудники →</router-link>
    </div>

    <div v-if="loading" class="loading-status">Загрузка...</div>
    <div v-else-if="error" class="error-status">{{ error }}</div>
    <div v-else-if="employees.length === 0" class="empty-status">Нет данных</div>

    <div v-else class="employees-list">
      <div v-for="employee in employees" :key="employee.id" class="employee-card">
        <div class="employee-info">
          <div class="name-role">
            <h5>{{ employee.name }}</h5>
            <span class="role-badge">{{ employee.role }}</span>
          </div>
          <span class="employee-status" :class="statusClass(employee.status)">
            {{ employee.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const employees = ref([])
const loading = ref(true)
const error = ref(null)

const statusClass = (status) => ({
  present: status === 'на месте',
  absent: status === 'отсутствует',
  sick: status === 'на больничном',
  vacation: status === 'в отпуске',
})

async function fetchEmployees() {
  try {
    loading.value = true
    error.value = null

    const { data, error: supabaseError } = await supabase
      .from('staff')
      .select(
        `
        id,
        name,
        role,
        status,
        phone_number,
        email
      `,
      )
      .limit(4)

    if (supabaseError) throw supabaseError
    employees.value = data || []
  } catch (err) {
    error.value = `Ошибка загрузки: ${err.message}`
    console.error('EmployeesPreview Error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEmployees()
})
</script>

<style scoped>
.employees-preview {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px) saturate(180%);
  border-radius: 20px;
  padding: 24px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.05),
    inset 0 0 12px rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  margin: 20px 0;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.view-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(108, 99, 255, 0.1) 100%);
  color: #0066ff;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.view-all::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 20%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 80%
  );
  opacity: 0;
  transition: opacity 0.4s;
}

.view-all:hover {
  box-shadow: 0 4px 20px rgba(0, 102, 255, 0.15);
  transform: translateY(-2px);
}

.view-all:hover::before {
  opacity: 1;
  animation: shine 1.5s;
}

.employees-list {
  display: grid;
  gap: 16px;
}

.employee-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px;
  background: rgba(248, 249, 250, 0.6);
  border-radius: 14px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.employee-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s;
}

.employee-card:hover {
  transform: translateX(8px);
  background: rgba(255, 255, 255, 0.8);
}

.employee-card:hover::after {
  left: 150%;
}

.name-role {
  flex: 1;
  position: relative;
  z-index: 1;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(0, 123, 255, 0.1) 100%);
  border-radius: 8px;
  font-size: 0.85em;
  font-weight: 500;
  color: #4d4dff;
  margin-top: 6px;
  backdrop-filter: blur(4px);
}

.employee-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
  font-weight: 500;
  margin: 0 15px;
  min-width: 100px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.present .status-dot {
  background: #00c853;
}
.absent .status-dot {
  background: #ff5252;
}
.sick .status-dot {
  background: #ffc107;
}
.vacation .status-dot {
  background: #00bcd4;
}

.profile-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(108, 99, 255, 0.1) 100%);
  color: #4d4dff;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.profile-link:hover {
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.2) 0%, rgba(108, 99, 255, 0.2) 100%);
  box-shadow: 0 4px 15px rgba(77, 77, 255, 0.1);
  transform: translateY(-2px);
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(0.95);
  }
}

@keyframes shine {
  0% {
    transform: translateX(-50%) rotate(45deg);
  }
  100% {
    transform: translateX(150%) rotate(45deg);
  }
}

.loading-status,
.error-status,
.empty-status {
  padding: 32px;
  text-align: center;
  color: rgba(0, 0, 0, 0.4);
  font-size: 1.1em;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  margin: 20px 0;
}

.error-status {
  color: #ff5252;
  background: rgba(255, 82, 82, 0.05);
}
</style>
