<template>
  <div class="app-wrapper">
    <NavBar v-if="showNavbar" />

    <main class="main-content">
      <div class="container mt-5">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import NavBar from '/src/components/NavBar.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  components: {
    NavBar,
  },
  setup() {
    const route = useRoute()
    
    const showNavbar = computed(() => route.path !== '/')
    
    return {
      showNavbar
    }
  }
}
</script>

<style>
.app-wrapper {
  background: #f8f9fa;
}
</style>
