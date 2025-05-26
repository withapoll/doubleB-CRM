<template>
  <div class="stats-container">
    <div class="row g-4">
      <!-- Карточка Прибыль -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stat-card">
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
        <div class="stat-card">
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
        <div class="stat-card">
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
        <div class="stat-card">
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
.stats-container {
  --profit: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  --expenses: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  --dishes: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  --staff: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}

.stat-card {
  border-radius: 20px;
  padding: 1.75rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 140px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 180deg at 50% 50%,
    transparent 0deg,
    rgba(255, 255, 255, 0.3) 180deg,
    transparent 360deg
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.stat-card:hover::before {
  opacity: 1;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

.stat-icon {
  font-size: 2.4rem;
  padding: 14px;
  border-radius: 14px;
  min-width: 56px;
  display: flex;
  justify-content: center;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

/* Цветовые темы для карточек */
.stat-card:nth-child(1) .stat-icon {
  background: var(--profit);
  color: white;
}
.stat-card:nth-child(2) .stat-icon {
  background: var(--expenses);
  color: white;
}
.stat-card:nth-child(3) .stat-icon {
  background: var(--dishes);
  color: white;
}
.stat-card:nth-child(4) .stat-icon {
  background: var(--staff);
  color: white;
}

.stat-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #1e293b;
  display: block;
  line-height: 1.3;
}

.stat-change {
  font-size: 0.95rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.positive {
  background: #dcfce7;
  color: #16a34a;
}

.negative {
  background: #fee2e2;
  color: #dc2626;
}

.stat-content {
  position: relative;
  z-index: 2;
}

@media (max-width: 768px) {
  .stat-card {
    padding: 1.25rem;
    min-height: 120px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-icon {
    font-size: 2rem;
    padding: 12px;
    min-width: 48px;
  }

  .stat-change {
    font-size: 0.85rem;
    padding: 0.3rem 0.7rem;
  }
}

@media (max-width: 480px) {
  .stat-title {
    font-size: 1rem;
  }

  .stat-value {
    font-size: 1.3rem;
  }

  .stat-icon {
    font-size: 1.8rem;
  }
}
</style>
