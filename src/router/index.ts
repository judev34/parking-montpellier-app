import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ParkingDetailView from '../views/ParkingDetailView.vue'
import { useHead } from '@vueuse/head'

// Domaine principal pour les liens canoniques
const DOMAIN = import.meta.env.VITE_DOMAIN || 'https://votredomaine.com';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Parkings Montpellier - Disponibilité en temps réel'
      }
    },
    {
      path: '/parking/:id',
      name: 'parking-details',
      component: ParkingDetailView,
      meta: {
        title: 'Détails du parking | Parkings Montpellier'
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: 'À propos | Parkings Montpellier'
      }
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80, // Offset pour prendre en compte la barre de navigation
      };
    }
    
    return { top: 0 };
  }
});

// Hook pour mettre à jour les balises canoniques à chaque changement de route
router.afterEach((to) => {
  // Créer l'URL canonique pour la page actuelle
  const canonicalUrl = `${DOMAIN}${to.fullPath}`;
  
  // Mettre à jour les balises HEAD avec l'URL canonique
  useHead({
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl
      }
    ]
  });
  
  // Mettre à jour le titre de la page
  if (to.meta.title) {
    useHead({ title: to.meta.title as string });
  }
});

export default router
