<script setup lang="ts">
import { ref } from 'vue';

// Props pour personnaliser le bouton
const props = defineProps({
  buttonText: {
    type: String,
    default: 'Faire un don'
  },
  paypalEmail: {
    type: String,
    default: 'votre-email@exemple.com' // Remplacer par votre email PayPal
  },
  amounts: {
    type: Array,
    default: () => [5, 10, 20]
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  showModal: {
    type: Boolean,
    default: false
  }
});

// État local pour gérer l'affichage du modal
const isModalOpen = ref(props.showModal);

// Méthode pour ouvrir le modal
const openModal = () => {
  isModalOpen.value = true;
};

// Méthode pour fermer le modal
const closeModal = () => {
  isModalOpen.value = false;
};

// Méthode pour créer un lien PayPal avec un montant spécifique
const createPaypalLink = (amount: number) => {
  return `https://www.paypal.com/donate/?business=${encodeURIComponent(props.paypalEmail)}&amount=${amount}&currency_code=${props.currency}`;
};
</script>

<template>
  <div>
    <!-- Bouton pour ouvrir le modal -->
    <button 
      @click="openModal" 
      class="px-4 py-2 rounded-lg text-white transition-colors"
      style="background-color: var(--metro-blue);"
    >
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 4.643-5.813 4.643h-2.189c-.11 0-.216.022-.302.066l-.705 4.47h2.145c.408 0 .752-.287.815-.689l.033-.175.653-4.11.042-.227a.818.818 0 0 1 .814-.69h.515c3.313 0 5.91-1.343 6.669-5.22.3-1.532.144-2.8-.529-3.782z" />
          <path d="M20.717 8.361a7.347 7.347 0 0 0-.246-.516 4.57 4.57 0 0 0-.48-.752 4.236 4.236 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 4.643-5.813 4.643h-2.189a.796.796 0 0 0-.302.066l-.705 4.47h2.145c.408 0 .752-.287.815-.689l.033-.175.653-4.11.042-.227a.818.818 0 0 1 .814-.69h.515c3.313 0 5.91-1.343 6.669-5.22.3-1.532.144-2.8-.529-3.782a4.236 4.236 0 0 0-.774-1.18c-.375-.392-.853-.712-1.432-.942-1.155-.462-2.55-.59-4.021-.59H9.73c-.524 0-.968.382-1.05.9L5.554 20.597a.641.641 0 0 0 .633.74h4.607a.818.818 0 0 0 .808-.687l.82-5.173-.023.124z" />
        </svg>
        {{ buttonText }}
      </div>
    </button>
    
    <!-- Modal de donation -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <!-- Bouton de fermeture -->
        <button 
          @click="closeModal" 
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Contenu du modal -->
        <div class="text-center">
          <h3 class="text-xl font-semibold mb-4" style="color: var(--metro-blue);">Soutenez l'application Parkings Montpellier</h3>
          
          <p class="text-gray-600 mb-6">
            Votre contribution nous aide à maintenir et améliorer cette application gratuite. Merci pour votre soutien !
          </p>
          
          <!-- Options de montants -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <a 
              v-for="amount in amounts" 
              :key="amount"
              :href="createPaypalLink(amount)"
              target="_blank"
              rel="noopener noreferrer"
              class="px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span class="font-semibold" style="color: var(--metro-blue);">{{ amount }}€</span>
            </a>
          </div>
          
          <!-- Lien pour montant personnalisé -->
          <a 
            :href="`https://www.paypal.com/donate/?business=${encodeURIComponent(paypalEmail)}&currency_code=${currency}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm hover:underline"
            style="color: var(--metro-blue);"
          >
            Choisir un autre montant
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ajouter des animations pour le modal */
.fixed {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
