import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/loginForm.vue'),
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/statisticsView.vue'),
    },
    {
      path: '/staff',
      name: 'staff',
      component: () => import('../views/staffView.vue'),
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/ordersView.vue'),
    },
  ],
})

export default router
