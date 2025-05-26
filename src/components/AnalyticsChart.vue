<template>
  <div class="analytics-chart">
    <div class="card shadow-sm">
      <div class="card-header d-flex flex-column gap-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Аналитика продаж</h5>
          <div class="d-flex gap-2">
            <select v-model="chartType" class="form-select form-select-sm">
              <option value="line">Линейный</option>
              <option value="bar">Столбчатый</option>
              <option value="area">Область</option>
            </select>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <input
            type="date"
            v-model="startDate"
            class="form-control form-control-sm"
            style="max-width: 150px"
          />
          <input
            type="date"
            v-model="endDate"
            class="form-control form-control-sm"
            style="max-width: 150px"
          />
          <select v-model="selectedEmployee" class="form-select form-select-sm">
            <option value="all">Все сотрудники</option>
            <option v-for="employee in employeesList" :key="employee.id" :value="employee.id">
              {{ employee.name }}
            </option>
          </select>
          <select v-model="selectedCategory" class="form-select form-select-sm">
            <option value="all">Все категории</option>
            <option v-for="category in categoriesList" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>

        <div v-else>
          <div v-if="!hasData" class="alert alert-info">
            Нет данных для отображения в выбранном диапазоне
          </div>
          <div v-else id="chart" ref="chartElement" style="min-height: 400px"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import ApexCharts from 'apexcharts'

const chartElement = ref(null)
const chart = ref(null)
const loading = ref(true)
const rawData = ref([])

// Фильтры и настройки
const selectedEmployee = ref('all')
const selectedCategory = ref('all')
const startDate = ref(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const chartType = ref('line')

// Списки для фильтров
const employeesList = ref([])
const categoriesList = ref([])

// Проверка наличия данных
const hasData = computed(() => {
  const dates = Object.keys(chartData.value)
  return dates.length > 0
})

// Вычисляемые данные для графика
const chartData = computed(() => {
  try {
    if (!rawData.value || rawData.value.length === 0) return {}

    return rawData.value.reduce((acc, item) => {
      // Проверка на null или undefined
      if (!item) return acc

      const date = item?.sale_date
      if (!date) return acc

      if (!acc[date]) {
        acc[date] = {
          totalSales: 0,
          totalProfit: 0,
          categories: {},
          staff: {},
        }
      }

      acc[date].totalSales += Number(item?.total_price) || 0
      acc[date].totalProfit += Number(item?.profit) || 0

      const category = item.product?.category || 'Без категории'
      acc[date].categories[category] =
        (acc[date].categories[category] || 0) + (Number(item.total_price) || 0)

      const employee = item.staff?.name || 'Неизвестный'
      acc[date].staff[employee] = (acc[date].staff[employee] || 0) + (Number(item.total_price) || 0)

      return acc
    }, {})
  } catch (error) {
    console.error('Ошибка обработки данных:', error)
    return {}
  }
})

const fetchData = async () => {
  try {
    loading.value = true
    console.log('Загрузка данных с параметрами:', {
      startDate: startDate.value,
      endDate: endDate.value,
      employee: selectedEmployee.value,
      category: selectedCategory.value,
    })

    let query = supabase
      .from('sales')
      .select(
        `
        id,
        sale_date,
        quantity,
        total_price,
        profit,
        product:product_id (name, category),
        staff:staff_id (name)
      `,
      )
      .gte('sale_date', startDate.value)
      .lte('sale_date', endDate.value)
      .order('sale_date', { ascending: true })

    if (selectedEmployee.value !== 'all') {
      query = query.eq('staff_id', selectedEmployee.value)
    }

    if (selectedCategory.value !== 'all') {
      // Правильный доступ к полю категории через соединение
      // Это может потребовать другого синтаксиса в зависимости от структуры Supabase
      query = query.eq('product.category', selectedCategory.value)
    }

    const { data, error } = await query

    if (error) {
      console.error('Ошибка Supabase:', error)
      throw error
    }

    console.log('Получены данные:', data?.length || 0, 'записей')
    rawData.value = data || []

    // Обновляем график после получения данных и убедимся, что DOM обновлен
    await nextTick()
    console.log('DOM обновлен после nextTick')

    // Небольшая задержка для гарантии рендеринга
    setTimeout(() => {
      updateChart()
    }, 50)
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    alert(`Ошибка загрузки данных: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const updateChart = () => {
  try {
    console.log('Попытка обновления графика...')
    console.log('chartElement.value:', chartElement.value)

    if (!chartElement.value) {
      console.warn('Элемент графика не найден в DOM')
      // Запланируем повторную попытку через небольшую задержку
      setTimeout(() => {
        if (chartElement.value) {
          console.log('Элемент графика найден после задержки, повторная попытка')
          updateChart()
        }
      }, 100)
      return
    }

    if (!rawData.value.length) {
      console.warn('Нет данных для отображения')
      return
    }

    const dates = Object.keys(chartData.value).sort()
    if (!dates.length) {
      console.warn('Нет обработанных данных для графика')
      return
    }

    const series = [
      {
        name: 'Общие продажи',
        data: dates.map((d) => chartData.value[d].totalSales),
      },
      {
        name: 'Прибыль',
        data: dates.map((d) => chartData.value[d].totalProfit),
      },
    ]

    const options = {
      chart: {
        type: chartType.value,
        height: 400,
        width: chartElement.value ? chartElement.value.offsetWidth : '100%',
        toolbar: {
          tools: {
            download: true,
          },
        },
        animations: {
          enabled: false, // Отключаем анимации для повышения стабильности
        },
      },
      xaxis: {
        categories: dates,
        type: 'datetime',
      },
      yaxis: {
        labels: {
          formatter: (value) => `${Math.round(value)}₽`,
        },
      },
      tooltip: {
        x: {
          formatter: (value) => new Date(value).toLocaleDateString('ru-RU'),
        },
        y: {
          formatter: (value) => `${value.toFixed(2)}₽`,
        },
      },
      colors: ['#3B82F6', '#10B981'],
      stroke: {
        curve: 'smooth',
      },
      dataLabels: {
        enabled: false,
      },
    }

    console.log('Обновление графика с данными:', series)

    try {
      if (chart.value) {
        console.log('Обновление существующего графика')
        chart.value.updateOptions(options)
        chart.value.updateSeries(series)
      } else {
        console.log('Создание нового графика')

        // Сначала проверим, нет ли остаточных элементов от предыдущих графиков
        const existingCharts = chartElement.value.querySelectorAll('.apexcharts-canvas')
        if (existingCharts.length > 0) {
          console.warn('Найдены остаточные элементы графика, удаляем их')
          existingCharts.forEach((el) => el.remove())
        }

        // Создаем новый экземпляр графика
        chart.value = new ApexCharts(chartElement.value, {
          ...options,
          series,
        })

        // Оборачиваем вызов render в try-catch для отлова возможных ошибок
        try {
          chart.value.render()
          console.log('График успешно отрисован')
        } catch (renderError) {
          console.error('Ошибка при отрисовке графика:', renderError)
          chart.value = null
        }
      }
    } catch (chartError) {
      console.error('Ошибка при работе с графиком:', chartError)

      // Если произошла ошибка, попробуем полностью пересоздать график
      try {
        if (chart.value) {
          chart.value.destroy()
        }
        chart.value = null

        // Очищаем все элементы графика
        if (chartElement.value) {
          chartElement.value.innerHTML = ''

          // Создаем новый экземпляр графика с нуля
          setTimeout(() => {
            chart.value = new ApexCharts(chartElement.value, {
              ...options,
              series,
            })
            chart.value.render()
          }, 50)
        }
      } catch (recoveryError) {
        console.error('Не удалось восстановить график:', recoveryError)
      }
    }
  } catch (error) {
    console.error('Ошибка обновления графика:', error)
  }
}

onMounted(async () => {
  try {
    console.log('Компонент монтирован, инициализация...')

    // Загрузка списков для фильтров
    const [{ data: staffData, error: staffError }, { data: productsData, error: productsError }] =
      await Promise.all([
        supabase.from('staff').select('id,name'),
        supabase.from('products').select('category'),
      ])

    if (staffError) console.error('Ошибка загрузки сотрудников:', staffError)
    if (productsError) console.error('Ошибка загрузки продуктов:', productsError)

    employeesList.value = staffData || []
    // Убираем дубликаты категорий
    categoriesList.value = [...new Set(productsData?.map((p) => p.category).filter(Boolean) || [])]

    console.log('Загружено сотрудников:', employeesList.value.length)
    console.log('Загружено категорий:', categoriesList.value.length)

    // Убедимся, что DOM полностью готов перед загрузкой данных
    await nextTick()
    await fetchData()

    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error('Ошибка инициализации компонента:', error)
  }
})

onBeforeUnmount(() => {
  console.log('Компонент размонтируется, очищаем ресурсы')

  try {
    if (chart.value) {
      console.log('Уничтожение графика перед размонтированием компонента')
      chart.value.destroy()
      chart.value = null
    }
  } catch (error) {
    console.error('Ошибка при уничтожении графика:', error)
  }

  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (chart.value && chartElement.value) {
    chart.value.updateOptions({
      chart: {
        width: chartElement.value.offsetWidth,
      },
    })
  }
}

// Следим за изменениями фильтров и типа графика
watch([startDate, endDate, selectedEmployee, selectedCategory], () => {
  // Если график уже существует, уничтожаем его перед загрузкой новых данных
  if (chart.value) {
    chart.value.destroy()
    chart.value = null
  }
  // Загружаем новые данные
  fetchData()
})

watch(chartType, () => {
  if (chart.value) {
    try {
      chart.value.updateOptions({
        chart: {
          type: chartType.value,
        },
      })
    } catch (error) {
      console.error('Ошибка при обновлении типа графика:', error)
      // Если ошибка, пересоздаем график
      chart.value.destroy()
      chart.value = null
      updateChart()
    }
  }
})
</script>

<style scoped>
.analytics-chart {
  margin-top: 2rem;
  padding: 0;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 28px;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.06),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4),
    inset 0 -4px 12px rgba(255, 255, 255, 0.4);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  position: relative;
}

.analytics-chart::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

.card-header {
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: left;
  gap: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
}

.chart-title {
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4f46e5 30%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
  position: relative;
  padding-left: 40px;
}

.chart-title::before {
  content: '📊';
  position: absolute;
  left: 0;
  top: -2px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

#chart {
  min-height: 420px;
  padding: 1.5rem 2rem 2rem;
  opacity: 0.95;
  transition: opacity 0.4s ease;
}

#chart:hover {
  opacity: 1;
}

.form-select-sm {
  max-width: 200px;
  border: 1px solid rgba(203, 213, 225, 0.3);
  border-radius: 12px;
  padding: 0.65rem 1.25rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.2em;
}

.form-select-sm:focus {
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow:
    0 0 0 3px rgba(99, 102, 241, 0.15),
    0 4px 24px rgba(99, 102, 241, 0.1);
  background-color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 768px) {
  .analytics-chart {
    margin-top: 1.5rem;
    border-radius: 24px;
  }

  .card-header {
    padding: 1.25rem;
    flex-direction: column;
    align-items: left;
    gap: 1rem;
  }

  .chart-title {
    font-size: 1.25rem;
    padding-left: 36px;
  }

  .chart-title::before {
    font-size: 1.2em;
    top: -1px;
  }

  #chart {
    min-height: 300px;
    padding: 1rem 1.25rem 1.5rem;
  }

  .form-select-sm {
    width: 100%;
    max-width: none;
  }
}

@keyframes chart-fade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#chart {
  animation: chart-fade 0.6s ease forwards;
}
</style>
