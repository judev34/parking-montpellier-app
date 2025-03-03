<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import config from '@/config/env';

// Lien de donation PayPal depuis la configuration
const paypalDonationUrl = config.paypalDonationUrl;

// Lien de donation Tipeee depuis la configuration
const tipeeDonationUrl = config.tipeeDonationUrl;

// Définir la date d'affichage minimale
const minDisplayDate = ref(new Date());

// État pour contrôler l'affichage
const isVisible = ref(false);

// Lors du montage du composant
onMounted(() => {
  // Récupérer la date de la dernière fermeture
  const lastCloseDate = localStorage.getItem('donate_banner_closed_at');
  
  // Si la bannière n'a jamais été fermée, l'afficher
  if (!lastCloseDate) {
    isVisible.value = true;
    return;
  }
  
  // Convertir la date de dernière fermeture en objet Date
  const lastCloseDateObj = new Date(lastCloseDate);
  
  // Calculer le délai depuis la dernière fermeture (en jours)
  const daysSinceLastClose = Math.floor((Date.now() - lastCloseDateObj.getTime()) / (1000 * 60 * 60 * 24));
  
  // Si plus de 30 jours se sont écoulés depuis la dernière fermeture, afficher la bannière
  if (daysSinceLastClose >= 30) {
    isVisible.value = true;
  }
});

// Méthode pour fermer la bannière
const closeBanner = () => {
  isVisible.value = false;
  
  // Stocker la date de fermeture
  localStorage.setItem('donate_banner_closed_at', new Date().toISOString());
};
</script>

<template>
  <div v-if="isVisible" class="relative bg-gray-100 border-b border-gray-200 py-4">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0 md:mr-8">
          <div class="text-lg font-semibold text-gray-800">
            Soutenez l'application Parkings Montpellier
          </div>
          <div class="text-gray-600 text-sm">
            Cette application est gratuite et sans publicités. Votre soutien nous aide à maintenir et améliorer ce service.
          </div>
          
          <div class="flex mt-2 space-x-2">
            <a 
              :href="paypalDonationUrl" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FontAwesomeIcon :icon="['fab', 'paypal']" class="mr-2" />
              PayPal
            </a>
            <a 
              :href="tipeeDonationUrl" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="bg-[#EC1651] hover:bg-[#d01447] text-white px-4 py-2 rounded-md flex items-center"
            >
              <img src="/icons/tipeee.svg" alt="Tipeee" class="h-4 mr-2" />
              Tipeee
            </a>
          </div>
        </div>
        
        <div class="flex items-center">
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
</template>

<style scoped>
/* Animation d'entrée/sortie */
.banner-enter-active,
.banner-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
