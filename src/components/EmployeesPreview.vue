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
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.view-all {
  color: #007bff;
  text-decoration: none;
  font-size: 0.9em;
  transition: opacity 0.3s;
}

.view-all:hover {
  opacity: 0.8;
}

.employees-list {
  display: grid;
  gap: 12px;
}

.employee-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: transform 0.2s;
}

.employee-card:hover {
  transform: translateX(5px);
}

.name-role {
  flex: 1;
}

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 0.8em;
  margin-top: 4px;
}

.employee-status {
  font-size: 0.9em;
  margin: 0 15px;
  min-width: 100px;
  text-align: center;
}

.present {
  color: #28a745;
}
.absent {
  color: #dc3545;
}
.sick {
  color: #ffc107;
}
.vacation {
  color: #17a2b8;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6c757d;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #dee2e6;
  transition: all 0.3s;
}

.profile-link:hover {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.loading-status,
.error-status,
.empty-status {
  padding: 20px;
  text-align: center;
  color: #6c757d;
}

.error-status {
  color: #dc3545;
}
</style>
