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
      path: '/logout',
      name: 'logout',
      component: () => import('../views/DoctorMainPageView.vue')
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: () => import('../views/ChangePasswordView.vue')
    },
    {
      path: '/main-doctor',
      name: 'main-doctor',
      component: () => import('../views/DoctorMainPageView.vue')
    },
    {
      path: '/patient-detailed',
      name: 'patient-detailed',
      component: () => import('../views/DetailedPatientView.vue')
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
      path: '/create-appointment',
      name: 'create-appointment',
      component: () => import('../views/CreateAppointmentView.vue')
    },
    {
      path: '/request-appointment',
      name: 'request-appointment',
      component: () => import('../views/CreateAppointmentView.vue')
    },
    {
      path: '/add-treatment',
      name: 'add-treatment',
      component: () => import('../views/AddOrUpdateTreatmentView.vue')
    },   
    {
      path: '/patient-treatment',
      name: 'patient-treatment',
      component: () => import('../views/TreatmentPatientView.vue')
    }, 
    {
      path: '/recommandations',
      name: 'recommandations',
      component: () => import('../views/RecommandationsView.vue')
    },
    {
      path: '/patient-cluster',
      name: 'patient-cluster',
      component: () => import('../views/GroupForPatientView.vue')
    },
    {
      path: '/all-patient-clusters',
      name: 'all-patient-clusters',
      component: () => import('../views/AllGroupsView.vue')
    },
    {
      path: '/add-recommandation',
      name: 'add-recommandation',
      component: () => import('../views/AddRecommandationView.vue')
    },
    {
      path: '/my-profile',
      name: 'my-profile',
      component: () => import('../views/PersonalDataView.vue')
    },
    {
      path: '/not-authenticated',
      name: 'not-authenticated',
      component: () => import('../views/NotAuthenticatedView.vue')
    }, 
    {
      path: '/not-found',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    },
    {
      path: "/:pathMatch(.*)*",
      alias: '/not-found',
      name: "not-found",
      component: () => import('../views/NotFoundView.vue'),
    },
  ]
})

export default router
