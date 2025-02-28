<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DonateButton from './DonateButton.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Props pour personnaliser la bannière
const props = defineProps({
  paypalEmail: {
    type: String,
    default: 'votre-email@exemple.com' // Remplacer par votre email PayPal
  },
  showProbability: {
    type: Number,
    default: 0.3 // 30% de chance d'afficher la bannière
  },
  cookieExpiration: {
    type: Number,
    default: 7 // Nombre de jours avant de réafficher la bannière après fermeture
  }
});

// État local pour gérer l'affichage de la bannière
const isVisible = ref(false);

// Fermer la bannière et enregistrer dans un cookie
const closeBanner = () => {
  isVisible.value = false;
  
  // Enregistrer la date de fermeture dans un cookie
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + props.cookieExpiration);
  document.cookie = `donateBannerClosed=true; expires=${expirationDate.toUTCString()}; path=/`;
};

// Vérifier si la bannière doit être affichée
onMounted(() => {
  // Vérifier si le cookie existe
  const hasCookie = document.cookie.split(';').some(item => item.trim().startsWith('donateBannerClosed='));
  
  // Si le cookie n'existe pas, afficher la bannière avec la probabilité définie
  if (!hasCookie && Math.random() < props.showProbability) {
    // Délai pour ne pas afficher immédiatement au chargement de la page
    setTimeout(() => {
      isVisible.value = true;
    }, 2000);
  }
});
</script>

<template>
  <transition name="slide-down">
    <div v-if="isVisible" class="fixed top-0 inset-x-0 z-50">
      <div class="bg-white shadow-md border-b border-gray-200 p-4">
        <div class="container mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div class="mb-4 sm:mb-0 sm:mr-6 flex-grow">
            <p class="text-sm sm:text-base">
              <span class="font-semibold" style="color: var(--metro-blue);">Vous aimez cette application ?</span> 
              Aidez-nous à maintenir ce service gratuit en faisant un don. Chaque contribution compte !
            </p>
          </div>
          
          <div class="flex items-center">
            <DonateButton 
              :paypal-email="paypalEmail" 
              button-text="Soutenir"
              :amounts="[3, 5, 10]"
            />
            
            <button 
              @click="closeBanner" 
              class="ml-4 text-gray-400 hover:text-gray-600"
              aria-label="Fermer"
            >
              <FontAwesomeIcon :icon="['fas', 'xmark']" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
