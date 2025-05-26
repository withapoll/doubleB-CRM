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
              <i class="bi bi-cup-hot me-2"></i>
              Кофейня
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/staff" class="nav-link" active-class="active">
              <i class="bi bi-people me-2"></i>
              Сотрудники
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/orders" class="nav-link" active-class="active">
              <i class="bi bi-journal-arrow-up me-2"></i>
              Блюда
            </router-link>
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
  padding: 1rem 2rem;
  background: rgba(22, 25, 28, 0.95) !important;
  backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.18),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05);
}

.navbar-nav {
  width: 100%;
  justify-content: center !important;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.4rem;
  background: #fff;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.navbar-brand:hover {
  opacity: 0.9;
  transform: translateX(2px);
}

.nav-link {
  position: relative;
  padding: 0.75rem 1.25rem !important;
  margin: 0 0.5rem;
  color: rgba(255, 255, 255, 0.8) !important;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 8px;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff88, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-link:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.nav-link:hover::before {
  opacity: 1;
}

.nav-link.active {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(97, 218, 251, 0.15) 100%);
  color: #00ff88 !important;
  font-weight: 500;
  box-shadow: 0 4px 24px rgba(0, 255, 136, 0.1);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: #00ff88;
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(0, 255, 136, 0.4);
}

@media (max-width: 991px) {
  .navbar {
    padding: 0.8rem 1.5rem;
    backdrop-filter: blur(24px);
  }

  .navbar-collapse {
    padding: 1rem 0;
    margin-top: 1rem;
    background: rgba(22, 25, 28, 0.98);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .nav-link {
    margin: 0.25rem 0;
    padding: 1rem 1.5rem !important;
  }

  .nav-link.active::after {
    display: none;
  }
}

.navbar-toggler {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 0.5rem !important;
}
</style>
