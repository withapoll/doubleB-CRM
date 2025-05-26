<template>
  <div class="app-wrapper">
    <NavBar />

    <main class="main-content">
      <div class="container mt-5">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import NavBar from '/src/components/NavBar.vue'

export default {
  components: {
    NavBar,
  },
}
</script>

<style>
.app-wrapper {
  background: #f8f9fa;
}
</style>
