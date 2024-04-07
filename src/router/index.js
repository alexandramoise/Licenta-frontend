import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
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
      component: () => import('../views/PatientMainPageView.vue')
    },
    {
      path: '/add-bloodpressure',
      name: 'add-bloodpressure',
      component: () => import('../views/AddOrUpdateBloodPressureView.vue')
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: () => import('../views/AppointmentsView.vue')
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
