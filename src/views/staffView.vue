<template>
  <div class="staff-page">
    <!-- <h1>Список сотрудников</h1> -->

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
            <p class="d-flex align-items-center gap-2">
              <i class="bi bi-person-badge fs-5 text-primary"></i>
              <strong>Должность:</strong> {{ employee.role }}
            </p>

            <p class="d-flex align-items-center gap-2">
              <i class="bi bi-circle-fill fs-6" :class="statusClass(employee.status)"></i>
              <strong>Статус:</strong>
              <span :class="statusClass(employee.status)">
                {{ employee.status }}
              </span>
            </p>

            <p class="d-flex align-items-center gap-2">
              <i class="bi bi-cash-stack fs-5 text-success"></i>
              <strong>Зарплата:</strong> {{ employee.salary }}
            </p>

            <p class="d-flex align-items-center gap-2">
              <i class="bi bi-telephone fs-5 text-info"></i>
              <strong>Телефон:</strong> {{ employee.phone_number }}
            </p>

            <p class="d-flex align-items-center gap-2">
              <i class="bi bi-envelope fs-5 text-secondary"></i>
              <strong>Email:</strong> {{ employee.email }}
            </p>
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
    // Добавим уведомление для пользователя
    uploadStatus.value = `Ошибка загрузки: ${error.message}`
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
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    uploadStatus.value = 'Обработка файла...';
    
    // Проверка расширения файла
    const validExtensions = /\.(csv|xlsx|xls)$/i;
    if (!validExtensions.test(file.name)) {
      throw new Error("Разрешены только CSV/Excel файлы");
    }

    const data = await readFile(file);
    const validatedData = validateData(data);

    console.log("Валидированные данные:", validatedData);
    
    uploadStatus.value = 'Загрузка в базу...';
    const { error } = await supabase
      .from('staff')
      .insert(validatedData);

    if (error) {
      console.error("Supabase error:", error);
      
      // Специальная обработка ошибки уникальности
      if (error.code === '23505') {
        const field = error.details.includes('email') ? 'email' : 'данных';
        throw new Error(`Конфликт ${field}: некоторые записи уже существуют`);
      }
      
      throw new Error(`Ошибка базы данных: ${error.message}`);
    }

    uploadStatus.value = `Успешно загружено ${validatedData.length} записей!`;
    setTimeout(() => (uploadStatus.value = ''), 5000);
    
    // Обновляем данные и сбрасываем фильтры
    await getStaff();
    resetFilters();
    
  } catch (error) {
    uploadStatus.value = `Ошибка: ${error.message}`;
    console.error('Import error:', error);
  } finally {
    // Сброс поля ввода файла
    event.target.value = '';
  }
};

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let workbook;
        
        if (file.name.endsWith('.csv')) {
          // Для CSV используем специальный парсер
          workbook = XLSX.read(e.target.result, {
            type: 'string',
            codepage: 65001, // UTF-8
            sheetStubs: true,
            cellDates: true
          });
        } else {
          // Для Excel бинарные данные
          const data = new Uint8Array(e.target.result);
          workbook = XLSX.read(data, { type: 'array' });
        }
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        if (!jsonData.length) {
          throw new Error("Файл не содержит данных");
        }
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

const validateData = (data) => {
  const requiredFields = ['name', 'email', 'phone_number', 'status', 'role', 'salary'];
  
  if (!Array.isArray(data)) {
    throw new Error("Некорректный формат данных");
  }

  return data.map((item, index) => {
    // Проверка обязательных полей
    requiredFields.forEach((field) => {
      if (item[field] === undefined || item[field] === null || item[field] === '') {
        throw new Error(`Строка ${index + 1}: отсутствует поле "${field}"`);
      }
    });

    // Проверка и нормализация email
    const email = item.email.toString().toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Строка ${index + 1}: неверный формат email`);
    }

    // Проверка и нормализация телефона
    let phone = item.phone_number.toString().replace(/[^\d+]/g, '');
    if (!phone.startsWith('+')) {
      phone = `+${phone}`;
    }

    // Проверка зарплаты
    const salary = Number(item.salary);
    if (isNaN(salary)) {
      throw new Error(`Строка ${index + 1}: зарплата должна быть числом`);
    }

    return {
      name: item.name.toString().trim(),
      email: email,
      phone_number: phone,
      status: item.status.toString(),
      role: item.role.toString(),
      salary: salary
    };
  });
};

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
.staff-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.filters {
  margin: 2rem 0;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.search-input {
  padding: 0.75rem 1.25rem;
  border: 1px solid rgba(203, 213, 225, 0.4);
  border-radius: 12px;
  background: rgba(241, 245, 249, 0.3);
  transition: all 0.3s ease;
  flex: 1;
  max-width: 320px;
  font-size: 0.95rem;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.filter-select {
  padding: 0.75rem 1.25rem;
  border: 1px solid rgba(203, 213, 225, 0.4);
  border-radius: 12px;
  background: rgba(241, 245, 249, 0.3);
  font-size: 0.95rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23646b75'%3e%3cpath d='M12 15l-5-5h10l-5 5z'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 16px;
}

.reset-btn,
.template-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(241, 245, 249, 0.6);
  border: 1px solid rgba(203, 213, 225, 0.4);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.reset-btn:hover,
.template-btn:hover {
  background: rgba(224, 231, 255, 0.4);
  transform: translateY(-1px);
}

.staff-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.staff-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.05),
    0 4px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.staff-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.4) 0%, transparent 60%);
  pointer-events: none;
}

.staff-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.08),
    0 6px 16px rgba(0, 0, 0, 0.04);
}

.staff-card h3 {
  margin: 0 0 1.25rem 0;
  color: #1e293b;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.015em;
  position: relative;
  padding-left: 2.5rem;
}

.staff-card h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1.75rem;
  height: 1.75rem;
  background: #6366f1;
  border-radius: 8px;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='currentColor' d='M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4Z'/%3E%3C/svg%3E");
  mask-size: contain;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.details p {
  margin: 0.75rem 0;
  font-size: 0.95em;
  padding: 0.75rem;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.details p:hover {
  background: rgba(241, 245, 249, 0.4);
}

.present {
  background: #dcfce7;
  color: #166534;
}
.absent {
  background: #fee2e2;
  color: #991b1b;
}
.sick {
  background: #fef9c3;
  color: #854d0e;
}
.vacation {
  background: #cffafe;
  color: #0e7490;
}

.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
  position: relative;
}

.status-indicator::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  opacity: 0.2;
}

.present .status-indicator::after {
  background: #22c55e;
}
.absent .status-indicator::after {
  background: #ef4444;
}
.sick .status-indicator::after {
  background: #eab308;
}
.vacation .status-indicator::after {
  background: #17a2b8;
}

.import-btn,
.export-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: #4f46e5;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.import-btn:hover,
.export-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .staff-page {
    padding: 1rem;
  }

  .filters {
    padding: 1rem;
    gap: 0.75rem;
  }

  .staff-list {
    grid-template-columns: 1fr;
  }

  .staff-card {
    padding: 1.25rem;
  }
}
</style>
