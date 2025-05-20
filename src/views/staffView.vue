<template>
  <div class="staff-page">
    <h1>Список сотрудников</h1>

    <!-- Компонент с карточками сотрудников -->
    <HumanStatsCards />

    <!-- Фильтры и поиск -->
    <div class="filters">
      <input
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="Поиск по имени"
        class="search-input"
      />

      <select v-model="selectedStatus" @change="getStaff" class="filter-select">
        <option value="">Все статусы</option>
        <option v-for="status in statusOptions" :value="status" :key="status">
          {{ status }}
        </option>
      </select>

      <select v-model="selectedRole" @change="getStaff" class="filter-select">
        <option value="">Все должности</option>
        <option v-for="role in roleOptions" :value="role" :key="role">
          {{ role }}
        </option>
      </select>

      <button @click="resetFilters" class="reset-btn">Сбросить фильтры</button>
      <button @click="downloadTemplate" class="template-btn">Скачать шаблон</button>
      <div class="import-section">
        <input
          type="file"
          ref="fileInput"
          accept=".csv,.xlsx,.xls"
          @change="handleFileUpload"
          style="display: none"
        />
        <button @click="$refs.fileInput.click()" class="import-btn">Импорт данных</button>
        <button @click="exportToCSV" class="export-btn">Экспорт в CSV</button>
        <div v-if="uploadStatus" class="upload-status">
          {{ uploadStatus }}
        </div>
      </div>
    </div>

    <div v-if="loading">Загрузка данных...</div>

    <div v-else>
      <div v-if="staff.length === 0" class="no-results">Сотрудники не найдены</div>

      <div v-else class="staff-list">
        <div v-for="employee in staff" :key="employee.id" class="staff-card">
          <h3>{{ employee.name }}</h3>
          <div class="details">
            <p><strong>Должность:</strong> {{ employee.role }}</p>
            <p>
              <strong>Статус:</strong>
              <span :class="statusClass(employee.status)">
                {{ employee.status }}
              </span>
            </p>
            <p><strong>Зарплата:</strong> {{ employee.salary }}</p>
            <p><strong>Телефон:</strong> {{ employee.phone_number }}</p>
            <p><strong>Email:</strong> {{ employee.email }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import * as XLSX from 'xlsx'
import HumanStatsCards from '@/components/HumanStatsCards.vue'

const staff = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedRole = ref('')

const statusOptions = ['на месте', 'отсутствует', 'на больничном', 'в отпуске']

const roleOptions = ['бариста', 'менеджер', 'администратор', 'су-шеф', 'повар']

async function getStaff() {
  try {
    loading.value = true

    let query = supabase.from('staff').select('*').order('name', { ascending: true })

    if (searchQuery.value) {
      query = query.ilike('name', `%${searchQuery.value}%`)
    }

    if (selectedStatus.value) {
      query = query.eq('status', selectedStatus.value)
    }

    if (selectedRole.value) {
      query = query.eq('role', selectedRole.value)
    }

    const { data, error } = await query

    if (error) throw error
    staff.value = data
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  } finally {
    loading.value = false
  }
}

function statusClass(status) {
  return {
    present: status === 'на месте',
    absent: status === 'отсутствует',
    sick: status === 'на больничном',
    vacation: status === 'в отпуске',
  }
}

function resetFilters() {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedRole.value = ''
  getStaff()
}

// Оптимизация поиска с задержкой
let timeoutId
function handleSearch() {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    getStaff()
  }, 300)
}

onMounted(() => {
  getStaff()
})

const exportToCSV = () => {
  const csvContent = [
    ['Имя', 'Email', 'Телефон', 'Статус', 'Должность', 'Зарплата'],
    ...staff.value.map((e) => [e.name, e.email, e.phone_number, e.status, e.role, e.salary]),
  ]
    .map((row) => row.join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `staff_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
}

const fileInput = ref(null)
const uploadStatus = ref('')

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    uploadStatus.value = 'Обработка файла...'
    const data = await readFile(file)
    const validatedData = validateData(data)

    uploadStatus.value = 'Загрузка в базу...'
    const { error } = await supabase.from('staff').insert(validatedData)

    if (error) throw error

    uploadStatus.value = 'Данные успешно загружены!'
    setTimeout(() => (uploadStatus.value = ''), 3000)
    getStaff() // Обновляем список
  } catch (error) {
    uploadStatus.value = `Ошибка: ${error.message}`
    console.error('Import error:', error)
  }
}

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(sheet)
      resolve(jsonData)
    }

    reader.onerror = (error) => reject(error)

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  })
}

const validateData = (data) => {
  const requiredFields = ['name', 'email', 'phone_number', 'status', 'role', 'salary']

  return data.map((item, index) => {
    // Проверка обязательных полей
    requiredFields.forEach((field) => {
      if (!item[field]) throw new Error(`Строка ${index + 1}: отсутствует поле ${field}`)
    })

    // Нормализация телефона
    if (item.phone_number) {
      item.phone_number = item.phone_number.replace(/[^\d+]/g, '')
    }

    return {
      name: item.name,
      email: item.email.toLowerCase().trim(),
      phone_number: item.phone_number,
      status: item.status,
      role: item.role,
      salary: item.salary,
    }
  })
}

const downloadTemplate = () => {
  const template = [
    ['name', 'email', 'phone_number', 'status', 'role', 'salary'],
    ['Иван Петров', 'ivan@example.com', '+79991234567', 'на месте', 'менеджер', '50000'],
  ]
    .map((row) => row.join(','))
    .join('\n')

  const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'staff_template.csv'
  link.click()
}
</script>

<style scoped>
.filters {
  margin: 20px 0;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
  max-width: 300px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.reset-btn,
.template-btn {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn :hover {
  background: #e0e0e0;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #666;
}

.staff-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.staff-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.staff-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.staff-card h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.details p {
  margin: 8px 0;
  font-size: 0.95em;
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

.loading {
  text-align: center;
  padding: 50px;
  font-size: 1.2em;
}

.import-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.import-btn,
.export-btn {
  padding: 8px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.import-btn:hover,
.export-btn:hover {
  background: #45a049;
}

.upload-status {
  color: #666;
  font-size: 0.9em;
}
</style>
