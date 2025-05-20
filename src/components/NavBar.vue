<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
    <div class="container-fluid">
      <router-link to="/statistics" class="navbar-brand"> ДАБЛБИ </router-link>

      <button
        class="navbar-toggler"
        type="button"
        @click="toggleMenu"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Основное меню -->
      <div class="collapse navbar-collapse" :class="{ show: isMenuOpen }" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/statistics" class="nav-link" active-class="active" exact>
              Кофейня
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/staff" class="nav-link" active-class="active">
              Сотрудники
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/orders" class="nav-link" active-class="active"> Блюда </router-link>
          </li>
        </ul>

        <!-- Дополнительные элементы справа -->
        <div class="d-flex align-items-center">
          <div class="dropdown">
            <button
              class="btn btn-outline-light dropdown-toggle"
              type="button"
              id="userDropdown"
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-person-circle me-2"></i>
              Андрей
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <router-link to="/" class="dropdown-item">Выйти</router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
// import { useRouter } from 'vue-router'

// const router = useRouter()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<style scoped>
.navbar {
  padding: 0.8rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-weight: 600;
  font-size: 1.25rem;
}

.nav-link {
  transition: all 0.3s ease;
  position: relative;
}

.nav-link.active {
  font-weight: 500;
  color: #fff !important;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 2px;
  background: #fff;
}

@media (max-width: 991px) {
  .navbar-collapse {
    padding: 1rem 0;
  }

  .nav-link.active::after {
    display: none;
  }
}
</style>
