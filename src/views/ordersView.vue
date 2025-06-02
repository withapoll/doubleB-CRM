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
import { ref, computed, onMounted, reactive } from 'vue'
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

const showProductModal = ref(false)
const isEditing = ref(false)
const currentProductId = ref(null)

const formData = reactive({
  name: '',
  description: '',
  category: '',
  price: 0,
  stock: 0,
})

const errors = reactive({
  name: '',
  category: '',
  price: '',
  stock: '',
})

const validateForm = () => {
  let isValid = true
  errors.name = formData.name.trim() ? '' : 'Название обязательно'
  errors.category = formData.category ? '' : 'Выберите категорию'
  errors.price = formData.price > 0 ? '' : 'Цена должна быть больше 0'
  errors.stock = formData.stock >= 0 ? '' : 'Неверное количество'

  isValid = !Object.values(errors).some((error) => error)
  return isValid
}

const resetForm = () => {
  formData.name = ''
  formData.description = ''
  formData.category = ''
  formData.price = 0
  formData.stock = 0
  currentProductId.value = null
  Object.keys(errors).forEach((key) => (errors[key] = ''))
}

const showAddForm = () => {
  isEditing.value = false
  resetForm()
  showProductModal.value = true
}

const editProduct = (product) => {
  isEditing.value = true
  currentProductId.value = product.id
  formData.name = product.name
  formData.description = product.description
  formData.category = product.category
  formData.price = product.price
  formData.stock = product.stock
  showProductModal.value = true
}

const closeProductModal = () => {
  showProductModal.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    }

    if (isEditing.value) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', currentProductId.value)

      if (error) throw error
    } else {
      const { error } = await supabase.from('products').insert(productData)

      if (error) throw error
    }

    await fetchData()
    closeProductModal()
  } catch (error) {
    console.error('Ошибка сохранения товара:', error)
    alert('Произошла ошибка при сохранении товара')
  }
}

async function deleteProduct(id) {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      alert('Ошибка удаления: ' + error.message)
      return
    }

    // Обновляем список товаров
    products.value = products.value.filter((p) => p.id !== id)
  } catch (error) {
    console.error('General error:', error)
    alert('Неизвестная ошибка при удалении')
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
:root {
  --surface: rgba(255, 255, 255, 0.85);
  --primary: #6366f1;
  --danger: #ef4444;
  --success: #22c55e;
  --warning: #eab308;
}

.products-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Статистические карточки */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.stat-card {
  background: var(--surface);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(12px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.05),
    0 4px 8px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
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
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.08),
    0 6px 16px rgba(0, 0, 0, 0.04);
}

.stat-card.low-stock {
  background: rgba(254, 226, 226, 0.85);
}

.stat-content {
  position: relative;
  z-index: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.03em;
  margin: 0.5rem 0;
}

.stat-card i {
  font-size: 2.5rem;
  opacity: 0.8;
  position: absolute;
  right: 1.5rem;
  bottom: 1.5rem;
  color: rgba(30, 41, 59, 0.15);
}

/* Панель управления */
.control-panel {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 16px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.search-section {
  display: flex;
  gap: 1rem;
  flex: 1;
  max-width: 600px;
}

.search-input {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(203, 213, 225, 0.4);
  border-radius: 12px;
  background: rgba(241, 245, 249, 0.3);
  transition: all 0.3s ease;
  flex: 1;
  font-size: 0.95rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.filter-select {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(203, 213, 225, 0.4);
  border-radius: 12px;
  background: rgba(241, 245, 249, 0.3);
  appearance: none;
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 16px;
}

.add-button {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: var(--primary);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  backdrop-filter: blur(4px);
}

.add-button:hover {
  background: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

/* Карточки товаров */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: var(--surface);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.05),
    0 4px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.08),
    0 6px 16px rgba(0, 0, 0, 0.04);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.4);
}

.product-category {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 500;
}

.product-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  background: rgba(241, 245, 249, 0.3);
}

.stat-item.low-stock {
  background: rgba(254, 226, 226, 0.3);
  color: var(--danger);
}

.btn-edit {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: var(--primary);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(4px);
}

.btn-edit:hover {
  background: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--danger);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(4px);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

.btn-order {
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: var(--primary);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(4px);
}

.btn-order:hover {
  background: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 24px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: modalSlide 0.3s ease-out;
}

.modal-header {
  border-bottom: 1px solid rgba(226, 232, 240, 0.4);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.form-control {
  padding: 0.75rem 1.25rem;
  border: 1px solid rgba(203, 213, 225, 0.4);
  border-radius: 12px;
  background: rgba(241, 245, 249, 0.3);
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(203, 213, 225, 0.3);
  color: #64748b;
}

.btn-secondary:hover {
  background: rgba(203, 213, 225, 0.5);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(203, 213, 225, 0.3);
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(203, 213, 225, 0.5);
}

@media (max-width: 768px) {
  .products-page {
    padding: 1rem;
  }

  .control-panel {
    flex-direction: column;
    padding: 1rem;
  }

  .search-section {
    flex-direction: column;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-card {
    padding: 1.25rem;
  }
}
</style>
