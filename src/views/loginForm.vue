<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4" style="max-width: 500px">
        <div class="card shadow-lg">
          <div class="card-body p-4 p-md-5">
            <h2 class="text-center mb-4 mb-lg-5">Авторизация</h2>

            <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
              <!-- Email Input -->
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control form-control-lg"
                  id="email"
                  v-model="form.email"
                  required
                  placeholder="example@mail.com"
                />
                <div class="invalid-feedback">Пожалуйста, введите корректный email</div>
              </div>

              <!-- Password Input -->
              <div class="mb-4">
                <label for="password" class="form-label">Пароль</label>
                <input
                  type="password"
                  class="form-control form-control-lg"
                  id="password"
                  v-model="form.password"
                  required
                  placeholder="••••••••"
                />
                <div class="invalid-feedback">Пожалуйста, введите пароль</div>
              </div>

              <!-- Submit Button -->
              <button type="submit" class="btn btn-primary btn-lg w-100 py-2">Войти</button>
            </form>
          </div>
        </div>
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
    handleSubmit() {
      const form = document.querySelector('.needs-validation')
      if (!form.checkValidity()) {
        form.classList.add('was-validated')
        return
      }
      this.submitForm()
    },
    submitForm() {
      console.log('Форма отправлена:', this.form)
      this.$router.push('/statistics')
    },
  },
}
</script>

<style scoped>
.card {
  border: none;
  border-radius: 1.25rem;
  transition: transform 0.3s ease;
  margin-top: 2rem;
}

.card:hover {
  transform: translateY(-3px);
}

.form-control {
  border-radius: 0.75rem;
  padding: 1.25rem;
  font-size: 1.05rem;
  border: 2px solid #e9ecef;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  border-radius: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  transition: all 0.2s ease;
}
</style>
