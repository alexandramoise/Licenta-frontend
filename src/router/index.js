import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/new',
      name: 'new',
      component: () => import('../views/InitiateAccountView.vue')
    }, 
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    }, 
    {
      path: '/main-doctor',
      name: 'main-doctor',
      component: () => import('../views/DoctorMainPageView.vue')
    },
    {
      path: '/main-patient',
      name: 'main-patient',
      component: () => import('../views/DoctorMainPageView.vue')
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('../views/DoctorMainPageView.vue')
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: () => import('../views/DoctorMainPageView.vue')
    },
    {
      path: '/my-profile',
      name: 'my-profile',
      component: () => import('../views/DoctorMainPageView.vue')
    },
    
  ]
})

export default router
