import { createRouter, createWebHistory } from 'vue-router'
import FetchView from '../views/FetchView.vue'
import HistoryView from '../views/HistoryView.vue'
import HomeView from '../views/HomeView.vue'
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/fetch',
      name: 'fetch',
      component: FetchView,
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
    },
    {
      path: '/profile/:id',
      name: 'profile',
      component: ProfileView,
    },
  ],
})

export default router
