<template>
  <div class="products-page">
    <!-- Статистика сверху -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-content">
          <h5>Всего товаров</h5>
          <div class="stat-value">{{ totalProducts }}</div>
          <i class="bi bi-boxes"></i>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <h5>Активных заказов</h5>
          <div class="stat-value">{{ activeOrders }}</div>
          <i class="bi bi-truck"></i>
        </div>
      </div>

      <div class="stat-card low-stock">
        <div class="stat-content">
          <h5>Товары заканчиваются</h5>
          <div class="stat-value">{{ lowStockCount }}</div>
          <i class="bi bi-exclamation-triangle"></i>
        </div>
      </div>
    </div>

    <!-- Панель управления -->
    <div class="control-panel">
      <div class="search-section">
        <input v-model="searchQuery" placeholder="Поиск товаров..." class="search-input" />
        <select v-model="selectedCategory" class="filter-select">
          <option value="">Все категории</option>
          <option v-for="category in categories" :value="category" :key="category">
            {{ category }}
          </option>
        </select>
      </div>

      <button @click="showAddForm" class="add-button">
        <i class="bi bi-plus-lg"></i> Добавить товар
      </button>
    </div>

    <!-- Список товаров -->
    <div class="products-grid">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card">
        <div class="product-header">
          <h3>{{ product.name }}</h3>
          <span class="product-category">{{ product.category }}</span>
        </div>

        <div class="product-body">
          <p>{{ product.description }}</p>
          <div class="product-stats">
            <div class="stat-item">
              <i class="bi bi-cash"></i>
              {{ product.price }} ₽
            </div>
            <div class="stat-item" :class="{ 'low-stock': product.stock < 10 }">
              <i class="bi bi-box"></i>
              {{ product.stock }} шт
            </div>
          </div>
        </div>

        <div class="product-actions">
          <button v-if="product.stock < 10" @click="openOrderModal(product)" class="btn-order">
            <i class="bi bi-cart-plus"></i> Заказать
          </button>
          <button @click="editProduct(product)" class="btn-edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button @click="deleteProduct(product.id)" class="btn-delete">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Форма добавления/редактирования (будет реализована позже) -->
  </div>
  <teleport to="body">
    <div v-if="showOrderModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Оформление заказа</h3>
          <button @click="closeOrderModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div v-if="selectedProduct" class="product-info">
            <h4>{{ selectedProduct.name }}</h4>
            <p>Текущий остаток: {{ selectedProduct.stock }} шт</p>
          </div>

          <div class="form-group">
            <label>Количество для заказа:</label>
            <input
              type="number"
              v-model="orderQuantity"
              min="1"
              class="form-control"
              :max="maxOrderQuantity"
            />
          </div>

          <div class="form-group">
            <label>Комментарий:</label>
            <textarea
              v-model="orderComment"
              class="form-control"
              rows="3"
              placeholder="Дополнительная информация..."
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeOrderModal" class="btn btn-secondary">Отмена</button>
          <button @click="submitOrder" class="btn btn-primary">Подтвердить заказ</button>
        </div>
      </div>
    </div>
  </teleport>
  <teleport to="body">
    <div v-if="showProductModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Редактирование товара' : 'Новый товар' }}</h3>
          <button @click="closeProductModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>Название <span class="required">*</span></label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="form-control"
                :class="{ invalid: errors.name }"
              />
              <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
            </div>

            <div class="form-group">
              <label>Описание</label>
              <textarea v-model="formData.description" class="form-control" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>Категория <span class="required">*</span></label>
              <select
                v-model="formData.category"
                required
                class="form-control"
                :class="{ invalid: errors.category }"
              >
                <option value="">Выберите категорию</option>
                <option v-for="category in categories" :value="category" :key="category">
                  {{ category }}
                </option>
              </select>
              <div v-if="errors.category" class="error-message">{{ errors.category }}</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Цена <span class="required">*</span></label>
                <input
                  v-model="formData.price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  class="form-control"
                  :class="{ invalid: errors.price }"
                />
                <div v-if="errors.price" class="error-message">{{ errors.price }}</div>
              </div>

              <div class="form-group">
                <label>Остаток <span class="required">*</span></label>
                <input
                  v-model="formData.stock"
                  type="number"
                  min="0"
                  required
                  class="form-control"
                  :class="{ invalid: errors.stock }"
                />
                <div v-if="errors.stock" class="error-message">{{ errors.stock }}</div>
              </div>
            </div>

            <div class="form-footer">
              <button type="button" @click="closeProductModal" class="btn btn-secondary">
                Отмена
              </button>
              <button type="submit" class="btn btn-primary">
                {{ isEditing ? 'Сохранить изменения' : 'Добавить товар' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const products = ref([])
const searchQuery = ref('')
const selectedCategory = ref('')
const categories = ref(['Напитки', 'Молочные продукты', 'Выпечка', 'Прочее'])

// Статистика
const totalProducts = ref(0)
const activeOrders = ref(0)
const lowStockCount = ref(0)

// Загрузка данных
async function fetchData() {
  try {
    // Загрузка товаров
    const { data: productsData } = await supabase.from('products').select('*')

    products.value = productsData
    totalProducts.value = productsData.length

    // Подсчет товаров с низким запасом
    lowStockCount.value = productsData.filter((p) => p.stock < 10).length

    // Загрузка заказов
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('status', 'в обработке')

    activeOrders.value = count
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
}

// Фильтрация товаров
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCategory = !selectedCategory.value || product.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

// Действия с товарами
function showAddForm() {
  // Реализация формы добавления
}

function editProduct(product) {
  // Реализация редактирования
}

async function deleteProduct(id) {
  try {
    await supabase.from('products').delete().eq('id', id)
    await fetchData()
  } catch (error) {
    console.error('Ошибка удаления:', error)
  }
}

onMounted(() => {
  fetchData()
})

const showOrderModal = ref(false)
const selectedProduct = ref(null)
const orderQuantity = ref(1)
const orderComment = ref('')
const maxOrderQuantity = ref(1000)

const openOrderModal = (product) => {
  selectedProduct.value = product
  showOrderModal.value = true
}

const closeOrderModal = () => {
  showOrderModal.value = false
  resetOrderForm()
}

const resetOrderForm = () => {
  orderQuantity.value = 1
  orderComment.value = ''
}

const submitOrder = async () => {
  try {
    if (!selectedProduct.value) return

    const { error } = await supabase.from('orders').insert([
      {
        product_id: selectedProduct.value.id,
        quantity: orderQuantity.value,
        comment: orderComment.value,
        status: 'в обработке',
      },
    ])

    if (error) throw error

    // Обновляем данные
    await fetchData()
    closeOrderModal()
    alert('Заказ успешно оформлен!')
  } catch (error) {
    console.error('Ошибка оформления заказа:', error)
    alert('Произошла ошибка при оформлении заказа')
  }
}
</script>

<style scoped>
.products-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.stat-card.low-stock {
  background: #fff3cd;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.search-section {
  display: flex;
  gap: 15px;
  flex: 1;
  max-width: 600px;
}

.search-input {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  flex: 1;
}

.filter-select {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.add-button {
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.product-category {
  background: #e9ecef;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8em;
}

.product-stats {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.low-stock {
  color: #dc3545;
  font-weight: 500;
}

.product-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-edit,
.btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-edit {
  background: #ffc107;
  color: white;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
  }

  .search-section {
    flex-direction: column;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
}

.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-order {
  background: #28a745;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  margin-right: auto;
}

.product-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
