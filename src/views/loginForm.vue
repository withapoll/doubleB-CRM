<template>
  <div class="auth-container">
    <div class="glass-card">
      <div class="card-content">
        <h2 class="auth-title">ДАБЛБИ</h2>
        <h2 class="auth-title">Вход в систему</h2>

        <form @submit.prevent="handleSubmit" class="auth-form" novalidate>
          <!-- Email Input -->
          <div class="input-group">
            <input
              type="email"
              class="modern-input"
              id="email"
              v-model="form.email"
              required
              placeholder=" "
            />
            <label for="email">Email</label>
            <i class="bi bi-envelope input-icon"></i>
            <div class="invalid-message">Пожалуйста, введите email</div>
          </div>

          <!-- Password Input -->
          <div class="input-group">
            <input
              type="password"
              class="modern-input"
              id="password"
              v-model="form.password"
              required
              placeholder=" "
            />
            <label for="password">Пароль</label>
            <i class="bi bi-lock input-icon"></i>
            <div class="invalid-message">Пожалуйста, введите пароль</div>
          </div>

          <button type="submit" class="auth-button">
            <span>Продолжить</span>
            <i class="bi bi-arrow-right"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
    }
  },
  methods: {
    handleSubmit(event) {
      const form = event.target
      if (!form.checkValidity()) {
        form.classList.add('was-validated')
        return
      }
      this.submitForm()
    },
    submitForm() {
      const validEmail = 'a.letch@double.com'
      const validPassword = 'polunin.me'
      
      if (this.form.email === validEmail && this.form.password === validPassword) {
        localStorage.setItem('isAuthenticated', 'true')
        console.log('Успешный вход!')
        this.$router.push('/statistics')
      } else {
        alert('Неверный email или пароль!')
      }
    },
  },
}
</script>

<style scoped>

.was-validated .modern-input:invalid {
  border-color: #ff6b6b;
}

.was-validated .modern-input:invalid ~ .invalid-message {
  display: block;
}

.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px) saturate(180%);
  border-radius: 2rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 440px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.05),
    inset 0 0 12px rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 20%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 80%
  );
  opacity: 0;
  transition: opacity 0.4s;
}

.glass-card:hover::before {
  opacity: 1;
  animation: shine 1.5s;
}

.auth-title {
  text-align: center;
  margin-bottom: 2.5rem;
  font-size: 1.8rem;
  background: #333;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.input-group {
  position: relative;
  margin-bottom: 1.75rem;
}

.modern-input {
  width: 100%;
  height: 56px;
  padding: 1.25rem 3rem;
  border: 2px solid transparent;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.modern-input:focus {
  outline: none;
  border-color: #818cf8;
  box-shadow:
    0 0 0 4px rgba(129, 140, 248, 0.15),
    0 4px 24px rgba(129, 140, 248, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.modern-input:placeholder-shown + label {
  transform: translateY(0);
  font-size: 1rem;
}

label {
  position: absolute;
  left: 3rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #4ade76;
  transition: all 0.3s ease;
  background: linear-gradient(0deg, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0) 50%);
  padding: 0 0.5rem;
}

.modern-input:focus + label,
.modern-input:not(:placeholder-shown) + label {
  transform: translateY(-200%);
  font-size: 0.875rem;
  color: #46e58b;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #2ae979;
  transition: color 0.3s ease;
}

.modern-input:focus ~ .input-icon {
  color: #21f564;
}

.invalid-message {
  display: none;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding-left: 0.5rem;
  animation: shake 0.4s ease;
}

.modern-input:invalid:not(:placeholder-shown) ~ .invalid-message {
  display: block;
}

.auth-button {
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 1rem;
  background: #333;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.auth-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px rgba(99, 241, 149, 0.3),
    0 4px 12px rgba(52, 225, 138, 0.2);
}

.auth-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.auth-button i {
  transition: transform 0.3s ease;
}

.auth-button:hover i {
  transform: translateX(4px);
}

@keyframes shine {
  0% {
    transform: translateX(-50%) rotate(45deg);
  }
  100% {
    transform: translateX(150%) rotate(45deg);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(6px);
  }
  75% {
    transform: translateX(-6px);
  }
}

@media (max-width: 480px) {
  .glass-card {
    padding: 1.5rem;
    border-radius: 1.5rem;
  }

  .modern-input {
    height: 52px;
    padding: 1rem 2.5rem;
  }

  label {
    left: 2.5rem;
  }

  .input-icon {
    left: 0.8rem;
  }
}
</style>
