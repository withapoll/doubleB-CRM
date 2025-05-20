<template>
  <div class="stats-container">
    <div class="row g-4">
      <!-- Карточка Прибыль -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stat-card bg-success text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-graph-up stat-icon me-3"></i>
              <div>
                <h5 class="stat-title mb-1">Прибыль</h5>
                <div class="stat-content">
                  <span class="stat-value">11.35 млн ₽</span>
                  <span class="stat-change positive">+15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Карточка Траты -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stat-card bg-danger text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-graph-down stat-icon me-3"></i>
              <div>
                <h5 class="stat-title mb-1">Траты</h5>
                <div class="stat-content">
                  <span class="stat-value">2.75 млн ₽</span>
                  <span class="stat-change negative">-2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Карточка Заказы -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stat-card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-cup-hot stat-icon me-3"></i>
              <div>
                <h5 class="stat-title mb-1">Блюда</h5>
                <div class="stat-content">
                  <span class="stat-value">25</span>
                  <span class="stat-change positive">+7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Карточка Сотрудники -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stat-card bg-warning text-dark">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-people stat-icon me-3"></i>
              <div>
                <h5 class="stat-title mb-1">Сотрудники</h5>
                <div class="stat-content">
                  <span class="stat-value">15</span>
                  <span class="stat-change positive">+25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsCards',
}
</script>

<style scoped>
.stat-card {
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  min-height: 120px;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2rem;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
}

.stat-title {
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  display: block;
}

.stat-change {
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
}

.positive {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.negative {
  background: rgba(0, 0, 0, 0.1);
  color: #fff;
}

@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 1rem;
  }

  .stat-value {
    font-size: 1.2rem;
  }

  .stat-icon {
    font-size: 1.5rem;
  }
}
</style>
